const fs = require('fs');
const crypto = require('crypto');
const resolve = require('../utils/pathResolver');
const { pipeline } = require('stream/promises');
const path = require('path');

module.exports = async function hash(cwd, opts) {
  const input = opts.input;
  if (!input) return console.log('Invalid input');
  const algo = opts.algorithm || 'sha256';
  if (!['sha256', 'md5', 'sha512'].includes(algo)) return console.log('Operation failed');
  const inPath = resolve(cwd, input);

  try {
    const hash = crypto.createHash(algo);
    await pipeline(
      fs.createReadStream(inPath),
      hash
    );
    const digest = hash.digest('hex');
    console.log(`${algo}: ${digest}`);
    if (opts.save) {
      const outPath = inPath + '.' + algo;
      await fs.promises.writeFile(outPath, digest);
    }
  } catch {
    return console.log('Operation failed');
  }
};