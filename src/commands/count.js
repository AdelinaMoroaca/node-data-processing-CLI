// src/commands/count.js
const fs = require('fs');
const resolve = require('../utils/pathResolver');

module.exports = async function count(cwd, opts) {
  const input = opts.input;
  if (!input) return console.log('Invalid input');
  const inPath = resolve(cwd, input);

  let lines = 0, words = 0, chars = 0;
  try {
    await new Promise((res, rej) => {
      const stream = fs.createReadStream(inPath, { encoding: 'utf8' });
      stream.on('data', chunk => {
        chars += chunk.length;
        lines += (chunk.match(/\n/g) || []).length;
        words += (chunk.match(/\S+/g) || []).length;
      });
      stream.on('end', res);
      stream.on('error', rej);
    });
    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${chars}`);
  } catch {
    return console.log('Operation failed');
  }
};