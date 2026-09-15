# Monitor selection implementation

`Dock.qml` owns monitor selection, shared window history, and the single `omadock`
IPC handler. `DockInstance.qml` owns each monitor's panel, hover state, menus and
overlap calculation. The primary instance remains alive when monitor selection
changes; additional instances follow connected screen objects through `Variants`.

The primary instance provides the shared application icon library, handles
notification sounds, and prunes shared window/launch history. Configuration file
watchers synchronize settings across instances. The existing `screen` key accepts
`all`; no migration is required for a saved connector name. Automatic selection
removes the key, so it cannot leave a stale named-screen preference behind.

## Automated checks

```sh
node tests/monitor-selection.test.cjs
node tests/folder-icons.test.cjs
```

These cover named and automatic selection, all monitors, disconnected-monitor
fallback, reconnection, zero monitors, and preservation of screen object identity.

## Runtime verification

On Omarchy 4.0.3 / Hyprland 0.56.2 with eDP-1 and HDMI-A-1:

- Load the plugin and inspect the Monitor menu.
- Select each named monitor and check that only that output owns a dock layer.
- Select All Monitors and check that both outputs own one dock layer each.
- Change alignment from the second dock and check it updates both docks.
- Select Automatic and check the saved screen key is removed.
- Set an unavailable connector and check fallback preserves the saved preference.
- Check IPC registration and runtime logs for duplicate handlers or QML errors.

Physical unplug/replug behavior is covered by selection logic tests; it has not
been exercised by unplugging a display during development.

Folder icon checks cover the Yaru-orange aliases used by Omarchy themes, explicit
color presets, dark variants, stack rows, and preservation of other icon choices.
