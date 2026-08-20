// Generate the DMG install-window background (660x420 PNG).
// Usage: swift make_dmg_bg.swift <icon.icns> <output.png>
import AppKit

let W: CGFloat = 660
let H: CGFloat = 420
let out = CommandLine.arguments[2]
let iconPath = CommandLine.arguments[1]

let image = NSImage(size: NSSize(width: W, height: H))
image.lockFocus()

// ── vertical gradient background ──
let full = NSRect(x: 0, y: 0, width: W, height: H)
let grad = NSGradient(colors: [
    NSColor(calibratedRed: 0.08, green: 0.12, blue: 0.22, alpha: 1.0),
    NSColor(calibratedRed: 0.13, green: 0.27, blue: 0.55, alpha: 1.0),
    NSColor(calibratedRed: 0.05, green: 0.10, blue: 0.30, alpha: 1.0),
])!
grad.draw(in: full, angle: -90)

// ── subtle grid / glow ──
let glow = NSGradient(colors: [
    NSColor(calibratedWhite: 1.0, alpha: 0.18),
    NSColor(calibratedWhite: 1.0, alpha: 0.0),
])!
glow.draw(in: NSRect(x: 0, y: 0, width: W, height: 130), angle: 90)

// ── App icon (derived from the app icon) ──
let iconSize: CGFloat = 150
if let iconImage = NSImage(contentsOfFile: iconPath) {
    let iconRect = NSRect(x: 55, y: (H - iconSize) / 2, width: iconSize, height: iconSize)
    // rounded-rect mask for the icon
    let mask = NSBezierPath(roundedRect: iconRect, xRadius: 30, yRadius: 30)
    NSGraphicsContext.saveGraphicsState()
    mask.addClip()
    iconImage.draw(in: iconRect, from: .zero, operation: .sourceOver, fraction: 1.0)
    NSGraphicsContext.restoreGraphicsState()
}

// ── Title text ──
let title = "DeepSeek Harness" as NSString
let titleFont = NSFont.systemFont(ofSize: 40, weight: .bold)
let titleAttrs: [NSAttributedString.Key: Any] = [.font: titleFont, .foregroundColor: NSColor.white]
let titleSize = title.size(withAttributes: titleAttrs)
title.draw(at: NSPoint(x: 235, y: H - 120), withAttributes: titleAttrs)

// ── subtitle ──
let sub = "桌面版 · macOS" as NSString
let subFont = NSFont.systemFont(ofSize: 17, weight: .medium)
let subAttrs: [NSAttributedString.Key: Any] = [.font: subFont, .foregroundColor: NSColor(calibratedWhite: 0.9, alpha: 1.0)]
sub.draw(at: NSPoint(x: 237, y: H - 150), withAttributes: subAttrs)

// ── install hint box ──
let boxRect = NSRect(x: 235, y: 110, width: 380, height: 120)
let box = NSBezierPath(roundedRect: boxRect, xRadius: 16, yRadius: 16)
NSColor(calibratedWhite: 1.0, alpha: 0.10).setFill()
box.fill()
let hint = "拖到 Applications 文件夹完成安装" as NSString
let hintFont = NSFont.systemFont(ofSize: 16, weight: .semibold)
let hintAttrs: [NSAttributedString.Key: Any] = [.font: hintFont, .foregroundColor: NSColor.white]
let hintSize = hint.size(withAttributes: hintAttrs)
hint.draw(at: NSPoint(x: boxRect.midX - hintSize.width/2, y: boxRect.midY - hintSize.height/2), withAttributes: hintAttrs)

image.unlockFocus()

guard
    let tiff = image.tiffRepresentation,
    let rep = NSBitmapImageRep(data: tiff),
    let png = rep.representation(using: .png, properties: [:])
else { fatalError("failed to render") }
let outURL = URL(fileURLWithPath: out)
try! FileManager.default.createDirectory(at: outURL.deletingLastPathComponent(), withIntermediateDirectories: true)
try! png.write(to: outURL)
print("wrote \(out)")
