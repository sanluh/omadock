import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Hyprland
import "MonitorSelection.js" as MonitorSelection

Item {
  id: root

  property var shell: null
  property string omarchyPath: ""
  property var manifest: null
  property string configPath: Quickshell.env("HOME") + "/.config/omarchy/omadock.json"
  property string screenName: ""
  readonly property var appLibrary: primaryDock.appLibrary
  readonly property var selectedScreens: MonitorSelection.selectScreens(Quickshell.screens, screenName)

  // Preserve window history across monitor selection and hotplug. Each dock
  // has its own hover/menu/autohide state, but shares these session records.
  property var minimizedOrigins: ({})
  property var parkedAt: ({})
  property var urgentMap: ({})
  property var recentOpenedWindowAddrs: ({})
  property var appRecentWindow: ({})
  property var launchPending: ({})

  FileView {
    id: configFile
    path: root.configPath
    watchChanges: true
    onLoaded: {
      try {
        var config = JSON.parse(String(text() || "{}"))
        root.screenName = config && typeof config.screen === "string" ? config.screen : ""
      } catch (e) { root.screenName = "" }
    }
    onFileChanged: reload()
  }

  // Keep the primary instance alive: screen changes must not lose pending
  // writes, shortcuts or the application's icon library.
  DockInstance {
    id: primaryDock
    controller: root
    primary: true
    shell: root.shell
    omarchyPath: root.omarchyPath
    manifest: root.manifest
    dockScreen: root.selectedScreens.length > 0 ? root.selectedScreens[0] : null
  }

  Variants {
    id: extraDocks
    model: root.selectedScreens.slice(1)
    delegate: DockInstance {
      required property var modelData
      controller: root
      shell: root.shell
      omarchyPath: root.omarchyPath
      manifest: root.manifest
      dockScreen: modelData
    }
  }

  function activeDock() {
    var monitor = Hyprland.focusedMonitor
    var docks = [primaryDock]
    for (var j = 0; j < extraDocks.instances.length; j++) docks.push(extraDocks.instances[j])
    for (var i = 0; i < docks.length; i++) {
      if (monitor && docks[i].dockScreen && docks[i].dockScreen.name === monitor.name) return docks[i]
    }
    return primaryDock
  }

  // Exactly one IPC endpoint, regardless of how many monitors are connected.
  // Visibility and window shortcuts operate on the focused monitor's dock.
  IpcHandler {
    target: "omadock"
    function minimizeActive(): void { root.activeDock().minimizeActive() }
    function restoreLast(): void { root.activeDock().restoreLast() }
    function toggleVisibility(): void {
      var dock = root.activeDock()
      dock.dockVisible = !dock.dockVisible
    }
    function reveal(): void { root.activeDock().dockVisible = true }
    function hide(): void { root.activeDock().dockVisible = false }
    function setAlignment(align: string): void { primaryDock.setDockAlignment(align) }
    function setPosition(pos: string): void { primaryDock.setDockPosition(pos) }
    function setScreen(name: string): void { primaryDock.setDockScreen(name) }
  }
}
