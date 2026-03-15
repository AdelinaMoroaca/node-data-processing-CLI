const fs = require('fs');
const path = require('path');

exports.up = function (cwd) {
  const parent = path.dirname(cwd);
  return parent === cwd ? cwd : parent;
};

exports.cd = async function (cwd, dir) {
  const target = path.isAbsolute(dir) ? dir : path.resolve(cwd, dir);
  try {
    const stat = await fs.promises.stat(target);
    if (stat.isDirectory()) return target;
  } catch {}
  return null;
};

exports.ls = async function (cwd) {
  try {
    const files = await fs.promises.readdir(cwd, { withFileTypes: true });
    const folders = files.filter(f => f.isDirectory()).map(f => f.name).sort();
    const regularFiles = files.filter(f => f.isFile()).map(f => f.name).sort();
    folders.forEach(f => console.log(`${f}    [folder]`));
    regularFiles.forEach(f => console.log(`${f}  [file]`));
  } catch {
    console.log('Operation failed');
  }
};
