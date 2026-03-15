// src/commands/decrypt.js
const fs = require('fs');
const crypto = require('crypto');
const resolve = require('../utils/pathResolver');
const { pipeline } = require('stream/promises');

module.exports = async function decrypt(cwd, opts) {
  const input = opts.input, output = opts.output, password = opts.password;
  if (!input || !output || !password) return console.log('Invalid input');
  const inPath = resolve(cwd, input), outPath = resolve(cwd, output);

  try {
    const stat = await fs.promises.stat(inPath);
    const fd = await fs.promises.open(inPath, 'r');
    const salt = Buffer.alloc(16);
    const iv = Buffer.alloc(12);
    const authTag = Buffer.alloc(16);

    await fd.read(salt, 0, 16, 0);
    await fd.read(iv, 0, 12, 16);
    await fd.read(authTag, 0, 16, stat.size - 16);

    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const inStream = fs.createReadStream(inPath, { start: 28, end: stat.size - 17 });
    await pipeline(
      inStream,
      decipher,
      fs.createWriteStream(outPath)
    );
  } catch {
    return console.log('Operation failed');
  }
};