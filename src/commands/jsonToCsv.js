// src/commands/jsonToCsv.js
const fs = require('fs');
const { pipeline } = require('stream/promises');
const resolve = require('../utils/pathResolver');

module.exports = async function jsonToCsv(cwd, opts) {
  const input = opts.input, output = opts.output;
  if (!input || !output) return console.log('Invalid input');
  const inPath = resolve(cwd, input), outPath = resolve(cwd, output);

  let jsonStr = '';
  try {
    await pipeline(
      fs.createReadStream(inPath),

      async function* (source) {
        for await (const chunk of source) jsonStr += chunk;
        let arr;
        try {
          arr = JSON.parse(jsonStr);
        } catch {
          throw new Error('Invalid JSON');
        }
        if (!Array.isArray(arr) || arr.length === 0) return;
        const headers = Object.keys(arr[0]);
        yield headers.join(',') + '\n';
        for (const obj of arr) {
          yield headers.map(h => obj[h]).join(',') + '\n';
        }
      },
      fs.createWriteStream(outPath)
    );
  } catch {
    return console.log('Operation failed');
  }
};