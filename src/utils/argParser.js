// src/utils/argParser.js
module.exports = function parseArgs(args) {
  const opts = {};
  let key = null;
  for (const arg of args) {
    if (arg.startsWith('--')) {
      key = arg.slice(2);
      opts[key] = true;
    } else if (key) {
      opts[key] = arg;
      key = null;
    }
  }
  return opts;
};