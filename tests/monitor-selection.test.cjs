const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../MonitorSelection.js'), 'utf8'), context);
const laptop = {name: 'eDP-1'}, external = {name: 'HDMI-A-1'};
const names = (screens, selection) => Array.from(context.selectScreens(screens, selection), s => s.name);
test('existing named screen selects the external monitor', () => {
  assert.deepEqual(names([laptop, external], 'HDMI-A-1'), ['HDMI-A-1']);
});
test('automatic and legacy missing screen select the first monitor', () => {
  for (const selection of ['', undefined, null])
    assert.deepEqual(names([laptop, external], selection), ['eDP-1']);
});
test('all selects each connected screen, including newly connected displays', () => {
  assert.deepEqual(names([laptop], 'all'), ['eDP-1']);
  assert.deepEqual(names([laptop, external], 'all'), ['eDP-1', 'HDMI-A-1']);
});
test('unplugging falls back and reconnecting restores the preferred screen', () => {
  assert.deepEqual(names([laptop], 'HDMI-A-1'), ['eDP-1']);
  assert.deepEqual(names([external, laptop], 'HDMI-A-1'), ['HDMI-A-1']);
});
test('no connected screens creates no visible dock', () => {
  for (const selection of ['', 'all', 'HDMI-A-1']) assert.deepEqual(names([], selection), []);
});
test('preserves screen objects so Variants can retain live instances', () => {
  assert.equal(context.selectScreens([laptop, external], 'all')[1], external);
});
