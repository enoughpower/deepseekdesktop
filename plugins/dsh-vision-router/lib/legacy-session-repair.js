import {
  closeSync,
  copyFileSync,
  constants as fsConstants,
  existsSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import {
  constants as zlibConstants,
  zstdCompressSync,
  zstdDecompressSync,
} from 'node:zlib'

const ZSTD_MAGIC = 0xFD2FB528
const DEFAULT_MAX_LOG_BYTES = 256 * 1024 * 1024
const DEFAULT_MAX_FRAME_PLAINTEXT_BYTES = 128 * 1024 * 1024
const SESSION_FILENAMES = new Set(['session.jsonl', 'session.jsonl.zstd'])
const REMINDER_PREFIX = '视觉深看工具已挂载：'
const CHECKSUM_OPTIONS = {
  params: { [zlibConstants.ZSTD_c_checksumFlag]: 1 },
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function stableRepairId(sessionId, seq) {
  return `vision-router-recovered-auto-mount:${sessionId}:${seq}`
}

/**
 * Exact signature of the pre-fix auto-mount reminder that Vision Router wrote
 * as a durable user/message without an id. Keep this deliberately narrow: a
 * generic malformed message still belongs to DSH's corruption diagnostics.
 */
export function isLegacyVisionRouterAutoMountEvent(event) {
  if (!isRecord(event) || event.type !== 'user/message') return false
  if (!Number.isSafeInteger(event.seq) || event.seq < 0) return false
  const data = event.data
  if (!isRecord(data) || Object.hasOwn(data, 'id') || data.role !== 'user') return false
  if (Object.keys(data).some((key) => !['role', 'content', 'source'].includes(key))) return false
  if (!Array.isArray(data.content) || !isRecord(data.source)) return false
  if (data.source.kind !== 'plugin' || data.source.plugin !== 'dsh-vision-router') return false
  return data.content.some((block) =>
    isRecord(block)
      && block.type === 'text'
      && typeof block.text === 'string'
      && block.text.startsWith(REMINDER_PREFIX),
  )
}

export function repairLegacyVisionRouterEvent(event, sessionId) {
  if (!isLegacyVisionRouterAutoMountEvent(event)) return event
  return {
    ...event,
    data: {
      ...event.data,
      id: stableRepairId(sessionId, event.seq),
    },
  }
}

/** Locate complete Zstandard frames without decompressing them. */
export function scanZstdFrameRanges(buffer) {
  const frames = []
  let offset = 0
  while (offset < buffer.length) {
    const start = offset
    if (buffer.length - offset < 4) return { frames, tornStart: start }
    if (buffer.readUInt32LE(offset) !== ZSTD_MAGIC) {
      throw new Error(`invalid Zstandard frame magic at byte ${offset}`)
    }
    offset += 4
    if (offset === buffer.length) return { frames, tornStart: start }

    const descriptor = buffer.readUInt8(offset)
    offset += 1
    if ((descriptor & 0x18) !== 0) {
      throw new Error(`reserved Zstandard frame-header bit at byte ${offset - 1}`)
    }

    const contentSizeFlag = descriptor >>> 6
    const singleSegment = (descriptor & 0x20) !== 0
    const checksum = (descriptor & 0x04) !== 0
    const dictionaryFlag = descriptor & 0x03
    const dictionaryBytes = dictionaryFlag === 3 ? 4 : dictionaryFlag
    const contentSizeBytes = contentSizeFlag === 0
      ? (singleSegment ? 1 : 0)
      : 1 << contentSizeFlag
    const remainingHeaderBytes = (singleSegment ? 0 : 1) + dictionaryBytes + contentSizeBytes
    if (buffer.length - offset < remainingHeaderBytes) return { frames, tornStart: start }
    offset += remainingHeaderBytes

    for (;;) {
      if (buffer.length - offset < 3) return { frames, tornStart: start }
      const blockHeader = buffer.readUIntLE(offset, 3)
      offset += 3
      const lastBlock = (blockHeader & 1) !== 0
      const blockType = (blockHeader >>> 1) & 0x03
      const blockSize = blockHeader >>> 3
      if (blockType === 0x03) {
        throw new Error(`reserved Zstandard block type at byte ${offset - 3}`)
      }
      const payloadBytes = blockType === 0x01 ? 1 : blockSize
      if (buffer.length - offset < payloadBytes) return { frames, tornStart: start }
      offset += payloadBytes
      if (lastBlock) break
    }

    if (checksum) {
      if (buffer.length - offset < 4) return { frames, tornStart: start }
      offset += 4
    }
    frames.push({ start, end: offset })
  }
  return { frames }
}

function parseHeaderLine(line) {
  let header
  try {
    header = JSON.parse(line)
  } catch {
    throw new Error('session header is not valid JSON')
  }
  if (!isRecord(header) || header.type !== 'session' || typeof header.id !== 'string' || header.id === '') {
    throw new Error('session header does not contain a valid id')
  }
  return header
}

function repairEventLines(text, sessionId) {
  if (!text.endsWith('\n')) throw new Error('logical session frame ends with a torn JSONL record')
  const lines = text.split('\n')
  const changedSeqs = []
  for (let index = 0; index < lines.length - 1; index += 1) {
    const line = lines[index]
    if (line === '') continue
    let row
    try {
      row = JSON.parse(line)
    } catch {
      throw new Error(`session event line ${index + 1} is not valid JSON`)
    }
    if (!isLegacyVisionRouterAutoMountEvent(row)) continue
    lines[index] = JSON.stringify(repairLegacyVisionRouterEvent(row, sessionId))
    changedSeqs.push(row.seq)
  }
  return { text: lines.join('\n'), changedSeqs }
}

function inspectRawArtifact(buffer) {
  if (!buffer.toString('utf8').endsWith('\n')) {
    throw new Error('raw session log has an incomplete final record; let DSH finish crash recovery first')
  }
  const text = buffer.toString('utf8')
  const newline = text.indexOf('\n')
  if (newline < 0) throw new Error('raw session log has no header line')
  const header = parseHeaderLine(text.slice(0, newline))
  const repaired = repairEventLines(text.slice(newline + 1), header.id)
  const output = repaired.changedSeqs.length === 0
    ? buffer
    : Buffer.from(`${text.slice(0, newline + 1)}${repaired.text}`, 'utf8')
  return { sessionId: header.id, output, changedSeqs: repaired.changedSeqs }
}

function decodeZstdFrame(buffer, range, maxOutputLength) {
  return zstdDecompressSync(buffer.subarray(range.start, range.end), { maxOutputLength })
}

function inspectZstdArtifact(buffer, maxFramePlaintextBytes) {
  const scan = scanZstdFrameRanges(buffer)
  if (scan.tornStart !== undefined) {
    throw new Error('Zstandard session log has an incomplete final frame; let DSH finish crash recovery first')
  }
  if (scan.frames.length === 0) throw new Error('Zstandard session log has no header frame')

  const headerPlain = decodeZstdFrame(buffer, scan.frames[0], maxFramePlaintextBytes)
  const headerText = headerPlain.toString('utf8')
  if (!headerText.endsWith('\n') || headerText.indexOf('\n') !== headerText.length - 1) {
    throw new Error('Zstandard session header frame is not exactly one JSONL line')
  }
  const header = parseHeaderLine(headerText.slice(0, -1))
  const chunks = [buffer.subarray(scan.frames[0].start, scan.frames[0].end)]
  const changedSeqs = []

  for (const frame of scan.frames.slice(1)) {
    const original = buffer.subarray(frame.start, frame.end)
    const plain = decodeZstdFrame(buffer, frame, maxFramePlaintextBytes)
    const repaired = repairEventLines(plain.toString('utf8'), header.id)
    changedSeqs.push(...repaired.changedSeqs)
    chunks.push(repaired.changedSeqs.length === 0
      ? original
      : zstdCompressSync(Buffer.from(repaired.text, 'utf8'), CHECKSUM_OPTIONS))
  }

  return {
    sessionId: header.id,
    output: changedSeqs.length === 0 ? buffer : Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
    changedSeqs,
  }
}

function fileIdentity(filePath) {
  const identity = statSync(filePath, { bigint: true })
  return {
    dev: identity.dev,
    ino: identity.ino,
    size: identity.size,
    mtimeNs: identity.mtimeNs,
    ctimeNs: identity.ctimeNs,
    mode: identity.mode,
  }
}

function sameIdentity(left, right) {
  return left.dev === right.dev
    && left.ino === right.ino
    && left.size === right.size
    && left.mtimeNs === right.mtimeNs
    && left.ctimeNs === right.ctimeNs
}

function writeSyncedFile(filePath, bytes, mode) {
  const fd = openSync(filePath, 'wx', Number(mode & 0o777n))
  try {
    writeFileSync(fd, bytes)
    fsyncSync(fd)
  } finally {
    closeSync(fd)
  }
}

function backupPathFor(filePath) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${filePath}.vision-router-backup-${stamp}-${randomBytes(3).toString('hex')}`
}

function temporaryPathFor(filePath) {
  return `${filePath}.vision-router-repair-${process.pid}-${randomBytes(4).toString('hex')}.tmp`
}

/**
 * Inspect or repair one DSH JSONL session artifact. Repair is offline-only:
 * the file identity is rechecked immediately before replacement and a full
 * byte-for-byte backup is created first.
 */
export function inspectLegacySessionArtifact(filePath, {
  fix = false,
  maxLogBytes = DEFAULT_MAX_LOG_BYTES,
  maxFramePlaintextBytes = DEFAULT_MAX_FRAME_PLAINTEXT_BYTES,
} = {}) {
  const before = fileIdentity(filePath)
  if (before.size > BigInt(maxLogBytes)) {
    throw new Error(`session log exceeds the ${maxLogBytes}-byte offline repair limit`)
  }
  const input = readFileSync(filePath)
  const zstd = filePath.endsWith('.zstd')
  const inspected = zstd
    ? inspectZstdArtifact(input, maxFramePlaintextBytes)
    : inspectRawArtifact(input)

  if (!fix || inspected.changedSeqs.length === 0) {
    return {
      path: filePath,
      sessionId: inspected.sessionId,
      encoding: zstd ? 'zstd' : 'none',
      affectedSeqs: inspected.changedSeqs,
      repaired: false,
    }
  }

  const latest = fileIdentity(filePath)
  if (!sameIdentity(before, latest)) {
    throw new Error('session log changed while it was being inspected; stop DSH and retry')
  }

  const backupPath = backupPathFor(filePath)
  const tempPath = temporaryPathFor(filePath)
  copyFileSync(filePath, backupPath, fsConstants.COPYFILE_EXCL)
  try {
    writeSyncedFile(tempPath, inspected.output, before.mode)
    const rightBeforeReplace = fileIdentity(filePath)
    if (!sameIdentity(before, rightBeforeReplace)) {
      throw new Error('session log changed before replacement; stop DSH and retry')
    }
    renameSync(tempPath, filePath)
    const verified = inspectLegacySessionArtifact(filePath, {
      fix: false,
      maxLogBytes,
      maxFramePlaintextBytes,
    })
    if (verified.affectedSeqs.length !== 0) {
      throw new Error('repaired session log still contains the legacy malformed reminder')
    }
  } catch (error) {
    rmSync(tempPath, { force: true })
    try {
      copyFileSync(backupPath, filePath)
    } catch {
      // Keep the original error; the backup path is returned in its message below.
    }
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${message} (backup: ${backupPath})`)
  }

  return {
    path: filePath,
    sessionId: inspected.sessionId,
    encoding: zstd ? 'zstd' : 'none',
    affectedSeqs: inspected.changedSeqs,
    repaired: true,
    backupPath,
  }
}

export function listSessionArtifacts(sessionsRoot) {
  if (!existsSync(sessionsRoot)) return []
  const found = []
  const pending = [sessionsRoot]
  while (pending.length > 0) {
    const dir = pending.pop()
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isSymbolicLink()) continue
      if (entry.isDirectory()) {
        pending.push(full)
        continue
      }
      if (entry.isFile() && SESSION_FILENAMES.has(entry.name)) found.push(full)
    }
  }
  return found.sort()
}

export function repairLegacySessionLogs({
  dshHome,
  fix = true,
  maxLogBytes = DEFAULT_MAX_LOG_BYTES,
  maxFramePlaintextBytes = DEFAULT_MAX_FRAME_PLAINTEXT_BYTES,
} = {}) {
  if (typeof dshHome !== 'string' || dshHome.trim() === '') {
    throw new TypeError('repairLegacySessionLogs requires dshHome')
  }
  const sessionsRoot = path.join(dshHome, 'sessions')
  const reports = []
  const errors = []
  for (const filePath of listSessionArtifacts(sessionsRoot)) {
    try {
      const report = inspectLegacySessionArtifact(filePath, {
        fix,
        maxLogBytes,
        maxFramePlaintextBytes,
      })
      if (report.affectedSeqs.length > 0 || report.repaired) reports.push(report)
    } catch (error) {
      errors.push({
        path: filePath,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
  return {
    sessionsRoot,
    exists: existsSync(sessionsRoot),
    scanned: listSessionArtifacts(sessionsRoot).length,
    affected: reports.reduce((sum, item) => sum + item.affectedSeqs.length, 0),
    repaired: reports.filter((item) => item.repaired).length,
    reports,
    errors,
    ok: errors.length === 0,
  }
}
