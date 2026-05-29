#!/usr/bin/env node
// changeset publish は workspace:* を置換しないため、publish 前にこのスクリプトで解決する
// https://github.com/changesets/action/issues/246

const fs = require('fs');
const path = require('path');

const packagesDir = path.resolve(__dirname, '../../packages');
const packageDirs = fs.readdirSync(packagesDir).filter((dir) =>
  fs.existsSync(path.join(packagesDir, dir, 'package.json')),
);

const versions = {};
for (const dir of packageDirs) {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(packagesDir, dir, 'package.json'), 'utf8'),
  );
  if (pkg.name && pkg.version) versions[pkg.name] = pkg.version;
}

for (const dir of packageDirs) {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  let changed = false;

  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [name, ver] of Object.entries(pkg[field] || {})) {
      if (ver === 'workspace:*' && versions[name]) {
        pkg[field][name] = '^' + versions[name];
        changed = true;
        console.log(`${pkg.name}: ${name} workspace:* -> ^${versions[name]}`);
      }
    }
  }

  if (changed) fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}
