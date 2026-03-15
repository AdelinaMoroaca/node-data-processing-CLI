// src/utils/pathResolver.js
const path = require('path');
module.exports = function resolve(cwd, p) {
  return path.isAbsolute(p) ? p : path.resolve(cwd, p);
};