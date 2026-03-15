// src/commands/hashCompare.js
const fs = require('fs');
const crypto = require
('crypto');
const resolve = require('../utils/pathResolver');
const { pipeline } = require('stream/promises');

module.exports = async function hashCompare(cwd, opts) {
  const input = opts.input, hashFile = opts.hash;
  if (!input || !hashFile) return console.log('Invalid input');
  const algo = opts.algorithm || 'sha256';
  if (!['sha256', 'md5', 'sha512'].includes(algo)) return console.log('Operation failed');
  const inPath = resolve(cwd, input), hashPath = resolve(cwd, hashFile);

  try {
    const hash = crypto.createHash(algo);
    await pipeline(
      fs.createReadStream(inPath),
      hash
    );
    const digest = hash.digest('hex').toLowerCase();

    const expected = (await fs.promises.readFile(hashPath, 'utf8')).trim().toLowerCase();

    if (digest === expected) {
      console.log('OK');
    } else {
      console.log('MISMATCH');
    }
  } catch {
    console.log('Operation failed');
  }
};