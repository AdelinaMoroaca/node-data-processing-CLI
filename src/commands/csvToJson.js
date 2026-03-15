// src/commands/csvToJson.js
const fs = require('fs');
const { pipeline } = require('stream/promises');
const { Transform } = require('stream');
const resolve = require('../utils/pathResolver');

module.exports = async function csvToJson(cwd, opts) {
  const input = opts.input, output = opts.output;
  if (!input || !output) return console.log('Invalid input');
  const inPath = resolve(cwd, input), outPath = resolve(cwd, output);

  let headers;
  let isFirst = true;
  let firstObj = true;

  const transform = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform(chunk, _, cb) {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (!headers) {
          headers = line.trim().split(',');
        } else if (line.trim()) {
          const values = line.split(',');
          const obj = {};
          headers.forEach((h, i) => obj[h] = values[i]);
          if (firstObj) {
            this.push('[' + JSON.stringify(obj));
            firstObj = false;
          } else {
            this.push(',' + JSON.stringify(obj));
          }
        }
      }
      cb();
    },
    flush(cb) {
      if (!firstObj) this.push(']');
      cb();
    }
  });

  try {
    await pipeline(
      fs.createReadStream(inPath),
      transform,
      fs.createWriteStream(outPath)
    );
  } catch {
    return console.log('Operation failed');
  }
};