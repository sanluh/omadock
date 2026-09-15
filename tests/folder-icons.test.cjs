const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const model = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../DockModel.js'), 'utf8'), model);
const places = { 'folder-download': 'folder-download', 'folder-documents': 'folder-documents',
  'folder-pictures': 'folder-pictures', 'folder-development': 'folder', 'user-home': 'user-home' };
test('orange theme resolves all pinned folder types to base Yaru assets', () => {
  for (const [icon, file] of Object.entries(places))
    assert.equal(model.resolveThemedFolderIcon(icon, 'Yaru-orange', 'theme', null),
      `file:///usr/share/icons/Yaru/256x256/places/${file}.png`);
});
test('orange aliases work for explicit color selection and dark theme', () => {
  for (const [alias, installed] of [['Yaru-orange', 'Yaru'], ['Yaru-orange-dark', 'Yaru-dark']]) {
    assert.equal(model.resolveThemedFolderIcon('folder', 'Yaru-blue', alias, null),
      `file:///usr/share/icons/${installed}/256x256/places/folder.png`);
    assert.equal(model.resolveThemedFolderIcon('folder', alias, 'auto', null),
      `file:///usr/share/icons/${installed}/256x256/places/folder.png`);
  }
});
test('folders inside stacks use the same corrected lookup', () => {
  assert.equal(model.resolveFileItemIcon('folder', 'Yaru-orange', 'theme', null),
    'file:///usr/share/icons/Yaru/256x256/places/folder.png');
});
test('other palettes, symbolic choices and custom paths retain their behavior', () => {
  assert.equal(model.resolveThemedFolderIcon('folder', 'Yaru-blue', 'theme', null),
    'file:///usr/share/icons/Yaru-blue/256x256/places/folder.png');
  for (const color of ['white', 'black', 'symbolic'])
    assert.equal(model.resolveThemedFolderIcon('folder', 'Yaru-orange', color, null),
      'file:///usr/share/icons/Adwaita/symbolic/places/folder-symbolic.svg');
  assert.equal(model.resolveThemedFolderIcon('/custom/folder.svg', 'Yaru-orange', 'theme', null), '/custom/folder.svg');
});
