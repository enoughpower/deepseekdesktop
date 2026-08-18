/**
 * dsh-plugin-image-input — client half (browser bundle)
 * ======================================================
 * 1) 发送接管：输入框有图片草稿且当前模型不支持图片时，按下 Enter 或点发送
 *    按钮会自动把图片转成文字描述——移除图片草稿、描述追加进草稿、再提交。
 *    会话里收到的就是"你的文字 + 图片识别上下文"，不会再被模型拒绝。
 *    模型支持图片时完全放行，不劫持原生图片通道。
 * 2) 自动转换：输入框粘贴/拖拽图片后按 Enter 或点发送，图片自动转文字带入上下文。
 * 3) 设置页"图片转文字"分节：baseUrl / model / apiKey / maxTokens 表单，
 *    通过 /plugins/mmv/config 读写 ~/.config/mm-vision/config.json。
 *
 * Bundle 协议：window.__ModuleLoader__.load({ id, factory })，factory
 * 通过 require() 取平台模块（react 等）。
 */
window.__ModuleLoader__.load({
  id: 'dsh-plugin-image-input',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const react = require('react')

    const BTN_STYLE = {
      border: '1px solid rgba(128,128,128,.35)',
      background: 'transparent',
      color: 'inherit',
      borderRadius: '8px',
      padding: '3px 10px',
      fontSize: '12px',
      lineHeight: '1.6',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    }
    const MSG_STYLE = {
      fontSize: '11px',
      color: '#888',
      maxWidth: '220px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }

    function toBase64(buf) {
      const bytes = new Uint8Array(buf)
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
      let out = ''
      const len = bytes.length
      for (let i = 0; i < len; i += 3) {
        const b0 = bytes[i]
        const b1 = i + 1 < len ? bytes[i + 1] : -1
        const b2 = i + 2 < len ? bytes[i + 2] : -1
        out += chars[b0 >> 2]
        out += chars[((b0 & 3) << 4) | (b1 >= 0 ? b1 >> 4 : 0)]
        out += b1 >= 0 ? chars[((b1 & 15) << 2) | (b2 >= 0 ? b2 >> 6 : 0)] : '='
        out += b2 >= 0 ? chars[b2 & 63] : '='
      }
      return out
    }

    async function readImageBytes(attachment) {
      const file = attachment && attachment.file
      if (file && typeof file.arrayBuffer === 'function') {
        return { buf: await file.arrayBuffer(), mediaType: file.type || 'image/png', size: file.size || 0 }
      }
      if (attachment && attachment.previewUrl) {
        const resp = await fetch(attachment.previewUrl)
        const blob = await resp.blob()
        return { buf: await blob.arrayBuffer(), mediaType: blob.type || 'image/png', size: blob.size || 0 }
      }
      throw new Error('无法读取图片数据')
    }

    async function analyzeOne(b64, mediaType) {
      const resp = await fetch('/plugins/mmv/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ b64, mediaType }),
      })
      return resp.json()
    }

    /** 逐张转换图片，返回文本块数组（每张图一段，含成功描述或失败原因）。 */
    async function convertAttachments(attachments) {
      const parts = []
      for (const att of attachments) {
        try {
          if (att.file && att.file.size > 10 * 1024 * 1024) {
            parts.push('【图片分析失败】图片超过 10MB，请压缩后重试')
            continue
          }
          const { buf, mediaType } = await readImageBytes(att)
          const res = await analyzeOne(toBase64(buf), mediaType)
          if (res && res.ok) {
            parts.push('【图片转文字 · ' + (res.model || '视觉模型') + '】\n' + String(res.text || ''))
          } else {
            parts.push('【图片分析失败】' + ((res && res.text) || (res && res.error) || '未知错误'))
          }
        } catch (err) {
          parts.push('【图片分析失败】' + String(err && err.message || err))
        }
      }
      return parts
    }

    /** 检查当前模型是否支持图片（支持时 true，查询失败时保守返回 false）。 */
    async function modelSupportsImage() {
      try {
        const cap = await fetch('/plugins/mmv/capability').then((r) => r.json())
        return !!(cap && cap.ok && cap.multimodal)
      } catch (e) {
        return false
      }
    }

    /**
     * 输入区组件：发送接管 + 手动转文字按钮。
     * props: { input: InputState, inputActions: InputActions, conversation }
     */
    const PickComp = (props) => {
      const [busy, setBusy] = react.useState(false)
      const [msg, setMsg] = react.useState('')
      const stateRef = react.useRef({ props, busy })
      stateRef.current = { props, busy }

      /** 有图片草稿且模型非多模态时接管一次"发送"（Enter 或发送按钮）。 */
      const interceptSend = (e) => {
        const { props: p, busy: b } = stateRef.current
        if (b) return
        const input = p.input
        const inputActions = p.inputActions
        const ids = (input && input.imageIds) || []
        if (ids.length === 0) return
        const conversation = p.conversation
        const attachments = conversation ? conversation.draftImages(ids) : []
        if (attachments.length === 0) return
        if (e && e.preventDefault) e.preventDefault()
        if (e && e.stopPropagation) e.stopPropagation()
        if (e && e.stopImmediatePropagation) e.stopImmediatePropagation()
        modelSupportsImage().then((multi) => {
          if (multi) {
            setMsg('当前模型支持图片：直接发送即可')
            return
          }
          doConvertAndSend(attachments, input, inputActions, conversation, ids)
        }).catch(() => doConvertAndSend(attachments, input, inputActions, conversation, ids))
      }

      /** 转换图片 → 移除图片草稿 → 描述追加进草稿 → 提交发送。 */
      const doConvertAndSend = async (attachments, input, inputActions, conversation, ids) => {
        setBusy(true)
        setMsg('正在把图片转为文字后发送…')
        try {
          const parts = await convertAttachments(attachments)
          const cur = (input && input.draft) || ''
          const block = parts.join('\n\n')
          if (inputActions && typeof inputActions.setDraft === 'function') {
            for (const id of ids) {
              try { inputActions.removeImage(id) } catch (err) { /* 忽略 */ }
            }
            inputActions.setDraft(cur ? cur + '\n\n' + block : block)
            setMsg('✓ 已转文字并发送')
            try { inputActions.submit() } catch (err) { /* 忽略 */ }
          } else {
            setMsg('✓ 转换完成，但无法插入输入框')
          }
        } catch (err) {
          setMsg('✗ 转换失败，已保留图片：' + String(err && err.message || err))
        }
        setBusy(false)
      }

      // 发送接管：document 捕获阶段监听 Enter 与发送按钮点击。
      // 只在本输入框有图片草稿时拦截；模型支持图片时放行。
      react.useEffect(() => {
        const onKey = (e) => {
          if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return
          const t = e.target
          if (!t || t.tagName !== 'TEXTAREA') return
          interceptSend(e)
        }
        const onClick = (e) => {
          const target = e.target
          const btn = target && target.closest ? target.closest('button') : null
          if (!btn) return
          const label = ((btn.getAttribute('aria-label') || '') + ' ' + (btn.getAttribute('title') || '') + ' ' + (btn.textContent || '')).toLowerCase()
          if (!/(send|发送)/.test(label)) return
          interceptSend(e)
        }
        document.addEventListener('keydown', onKey, true)
        document.addEventListener('click', onClick, true)
        return () => {
          document.removeEventListener('keydown', onKey, true)
          document.removeEventListener('click', onClick, true)
        }
      }, [])

      // 不渲染按钮：仅保留自动接管。msg 作为短暂状态提示（成功/失败/进度），
      // 出现在输入框左侧，几秒后自行消失，避免打扰。
      if (!msg) return null
      return react.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px', maxWidth: '100%' } },
        react.createElement('span', { style: MSG_STYLE, title: msg }, msg)
      )
    }

    // ---- 设置页配置表单 ----
    const FIELD_STYLE = {
      display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0', maxWidth: '560px',
    }
    const LABEL_STYLE = { width: '90px', flex: 'none', fontSize: '13px' }
    const INPUT_STYLE = {
      flex: '1', minWidth: '0', border: '1px solid rgba(128,128,128,.35)', borderRadius: '6px',
      padding: '4px 8px', fontSize: '13px', background: 'transparent', color: 'inherit',
    }
    const ConfigComp = () => {
      const [form, setForm] = react.useState(null)
      const [msg, setMsg] = react.useState('')
      react.useEffect(() => {
        fetch('/plugins/mmv/config').then((r) => r.json()).then((res) => {
          if (res && res.ok) {
            setForm({
              baseUrl: res.config.baseUrl || '',
              model: res.config.model || '',
              apiKey: '',
              maxTokens: res.config.maxTokens || 2048,
              apiKeySet: !!res.config.apiKeySet,
            })
          } else {
            setMsg('读取配置失败：' + ((res && res.error) || '未知错误'))
          }
        }).catch((err) => setMsg('读取配置失败：' + String(err && err.message || err)))
      }, [])
      const set = (key) => (e) => setForm({ ...form, [key]: key === 'maxTokens' ? Number(e.target.value) : e.target.value })
      const save = () => {
        if (!form) return
        fetch('/plugins/mmv/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ baseUrl: form.baseUrl, model: form.model, apiKey: form.apiKey, maxTokens: form.maxTokens }),
        }).then((r) => r.json()).then((res) => {
          if (res && res.ok) {
            setMsg('✓ 已保存到 ' + res.file + (form.apiKey ? '（API Key 已更新）' : (res.config.apiKeySet ? '（保留原 API Key）' : '（尚未设置 API Key）')))
            setForm((f) => ({ ...f, apiKey: '', apiKeySet: res.config.apiKeySet }))
          } else {
            setMsg('保存失败：' + ((res && res.error) || '未知错误'))
          }
        }).catch((err) => setMsg('保存失败：' + String(err && err.message || err)))
      }
      if (!form) {
        return react.createElement('div', null, msg || '加载中…')
      }
      return react.createElement('div', { style: { padding: '4px 0' } },
        react.createElement('p', { style: { margin: '0 0 8px', fontSize: '13px', color: '#888' } },
          '当前模型没有视觉能力时，输入框粘贴/拖拽图片后按 Enter 或点发送，会自动调用下面的视觉 API 把图片转成文字一并发出。任意 OpenAI 兼容视觉模型均可（qwen-vl / gpt-4o / glm-4v / MiniMax-VL…）。'),
        react.createElement('div', { style: FIELD_STYLE },
          react.createElement('label', { style: LABEL_STYLE }, '接口地址'),
          react.createElement('input', { style: INPUT_STYLE, value: form.baseUrl, onChange: set('baseUrl'), placeholder: 'https://dashscope.aliyuncs.com/compatible-mode/v1' })),
        react.createElement('div', { style: FIELD_STYLE },
          react.createElement('label', { style: LABEL_STYLE }, '模型'),
          react.createElement('input', { style: INPUT_STYLE, value: form.model, onChange: set('model'), placeholder: 'qwen-vl-max' })),
        react.createElement('div', { style: FIELD_STYLE },
          react.createElement('label', { style: LABEL_STYLE }, 'API Key'),
          react.createElement('input', { style: INPUT_STYLE, type: 'password', value: form.apiKey, onChange: set('apiKey'), placeholder: form.apiKeySet ? '已设置（留空保持不变）' : 'sk-…' })),
        react.createElement('div', { style: FIELD_STYLE },
          react.createElement('label', { style: LABEL_STYLE }, '最大输出'),
          react.createElement('input', { style: INPUT_STYLE, type: 'number', min: 1, value: form.maxTokens, onChange: set('maxTokens') })),
        react.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' } },
          react.createElement('button', { style: { ...BTN_STYLE, padding: '5px 16px' }, onClick: save }, '保存'),
          msg ? react.createElement('span', { style: MSG_STYLE, title: msg }, msg) : null),
      )
    }

    function apply(ctx) {
      const slots = ctx.get('slots')
      if (slots === undefined) return
      const conversation = ctx.get('conversation')

      ctx.effect(() => slots.inject('conversation.input.left', () => slots.register(
        { name: 'conversation.input.left', id: 'image-input-pick' },
        (props) => react.createElement(PickComp, { ...props, conversation }),
      )))

      ctx.effect(() => slots.inject('settings.section', () => slots.register(
        { name: 'settings.section', id: 'image-input-config', label: () => '图片转文字' },
        () => react.createElement(ConfigComp),
      )))
    }

    exports.apply = apply
    return module.exports
  },
})
