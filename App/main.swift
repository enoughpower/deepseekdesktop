import Cocoa
import WebKit

// MARK: - Backend supervisor

/// Spawns `node launcher.mjs` inside the app bundle and parses its single
/// `DSH_READY=<url>` line. The launcher boots the `dsh web` backend on a
/// loopback port chosen by the OS and confirms it answers before announcing.
final class BackendController {
    private var process: Process?
    private let onReady: (URL) -> Void
    private let onExit: (Int32) -> Void

    init(onReady: @escaping (URL) -> Void, onExit: @escaping (Int32) -> Void) {
        self.onReady = onReady
        self.onExit = onExit
    }

    func start() {
        guard let resourcePath = Bundle.main.resourcePath else {
            onExit(1)
            return
        }
        let backendDir = (resourcePath as NSString).appendingPathComponent("backend")
        let node = (backendDir as NSString).appendingPathComponent("node")
        let launcher = (backendDir as NSString).appendingPathComponent("launcher.mjs")

        let proc = Process()
        proc.executableURL = URL(fileURLWithPath: node)
        proc.arguments = [launcher]
        proc.currentDirectoryURL = URL(fileURLWithPath: backendDir)

        var env = ProcessInfo.processInfo.environment
        env["HOME"] = NSHomeDirectory()
        env["DSH_TELEMETRY_DISABLED"] = "1"
        proc.environment = env

        let outPipe = Pipe()
        proc.standardOutput = outPipe
        proc.standardError = FileHandle.standardError

        outPipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard !data.isEmpty else { return }
            if let text = String(data: data, encoding: .utf8) {
                self?.handleOutput(text)
            }
        }

        proc.terminationHandler = { [weak self] p in
            DispatchQueue.main.async { self?.onExit(p.terminationStatus) }
        }

        do {
            try proc.run()
            process = proc
        } catch {
            onExit(1)
        }
    }

    func stop() {
        if let p = process, p.isRunning {
            p.terminate() // SIGTERM; launcher forwards it to dsh web
        }
    }

    private func handleOutput(_ text: String) {
        for line in text.components(separatedBy: .newlines) {
            guard line.hasPrefix("DSH_READY=") else { continue }
            let value = String(line.dropFirst("DSH_READY=".count)).trimmingCharacters(in: .whitespaces)
            if let url = URL(string: value) {
                DispatchQueue.main.async { [weak self] in self?.onReady(url) }
            }
        }
    }
}

// MARK: - App delegate

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate {
    private var window: NSWindow!
    private var webView: WKWebView!
    private var backend: BackendController!
    private var backendReady = false
    private var hasLoadedUI = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        buildMenu()
        buildWindow()

        backend = BackendController(
            onReady: { [weak self] url in
                self?.backendReady = true
                self?.load(url)
            },
            onExit: { [weak self] code in
                // If the backend died before the UI ever loaded, surface the error.
                if let self = self, !self.hasLoadedUI {
                    self.showMessage("DeepSeek Harness 后端未能启动（退出码 \(code)）。\n请检查日志或重新打开应用。")
                }
            }
        )
        backend.start()
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    func applicationWillTerminate(_ notification: Notification) {
        backend?.stop()
    }

    private func buildMenu() {
        let mainMenu = NSMenu()
        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "关于 DeepSeek Harness", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "隐藏", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "退出", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appMenuItem.submenu = appMenu
        NSApp.mainMenu = mainMenu
    }

    private func buildWindow() {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true

        let rect = NSRect(x: 0, y: 0, width: 1240, height: 820)
        window = NSWindow(
            contentRect: rect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        window.title = "DeepSeek Harness"
        window.titlebarAppearsTransparent = false
        window.center()
        window.contentView = webView
        window.setFrameAutosaveName("DeepSeekHarnessWindow")
        window.makeKeyAndOrderFront(nil)
    }

    private func load(_ url: URL) {
        hasLoadedUI = true
        webView.load(URLRequest(url: url))
    }

    private func showMessage(_ text: String) {
        let alert = NSAlert()
        alert.messageText = "DeepSeek Harness"
        alert.informativeText = text
        alert.alertStyle = .warning
        alert.addButton(withTitle: "好")
        alert.runModal()
    }

    // MARK: WKNavigationDelegate

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if let title = webView.title, !title.isEmpty {
            window.title = title
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        // Retry once the backend announces readiness; transient while the port binds.
        if backendReady {
            if let url = webView.url {
                webView.load(URLRequest(url: url))
            }
        }
    }

    // MARK: WKUIDelegate

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url {
            webView.load(URLRequest(url: url))
        }
        return nil
    }
}

// MARK: - Entry point

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
