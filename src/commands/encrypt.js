const fs = require('fs');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');
const resolve = require('../utils/pathResolver');

module.exports = async function encrypt(cwd, opts) {
  const input = opts.input, output = opts.output, password = opts.password;
  if (!input || !output || !password) return console.log('Invalid input');
  const inPath = resolve(cwd, input), outPath = resolve(cwd, output);

  try {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const outStream = fs.createWriteStream(outPath);
    outStream.write(salt);
    outStream.write(iv);

    await pipeline(
      fs.createReadStream(inPath),
      cipher,
      outStream
    );
    const authTag = cipher.getAuthTag();
    await fs.promises.appendFile(outPath, authTag);
  } catch {
    return console.log('Operation failed');
  }
};