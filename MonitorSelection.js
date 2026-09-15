// Screen names are stable connector identifiers (e.g. HDMI-A-1).
// Keep an unavailable preference so reconnecting restores the selected screen.
function selectScreens(screens, selection) {
  var connected = []
  for (var i = 0; i < screens.length; i++) connected.push(screens[i])
  if (selection === "all") return connected
  for (var j = 0; j < connected.length; j++) {
    if (connected[j].name === selection) return [connected[j]]
  }
  return connected.length > 0 ? [connected[0]] : []
}
