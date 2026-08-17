// Generate the DeepSeek Harness app icon (1024x1024 PNG).
// Usage: swift make_icon.swift <output.png>
import AppKit

let size = NSSize(width: 1024, height: 1024)
let image = NSImage(size: size)
image.lockFocus()

let rect = NSRect(origin: .zero, size: size)
let bg = NSBezierPath(roundedRect: rect, xRadius: 224, yRadius: 224)
let gradient = NSGradient(colors: [
    NSColor(calibratedRed: 0.13, green: 0.40, blue: 0.98, alpha: 1.0),
    NSColor(calibratedRed: 0.03, green: 0.16, blue: 0.55, alpha: 1.0),
])!
gradient.draw(in: bg, angle: -90)

let text = "DS" as NSString
let font = NSFont.systemFont(ofSize: 400, weight: .bold)
let attrs: [NSAttributedString.Key: Any] = [
    .font: font,
    .foregroundColor: NSColor.white,
]
let textSize = text.size(withAttributes: attrs)
text.draw(
    at: NSPoint(x: (size.width - textSize.width) / 2, y: (size.height - textSize.height) / 2),
    withAttributes: attrs
)

image.unlockFocus()

guard
    let tiff = image.tiffRepresentation,
    let rep = NSBitmapImageRep(data: tiff),
    let png = rep.representation(using: .png, properties: [:])
else {
    FileHandle.standardError.write("failed to render icon\n".data(using: .utf8)!)
    exit(1)
}
try! png.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
