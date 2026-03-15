// src/commands/logStats.js
const fs = require('fs');
const os = require('os');
const { Worker } = require('worker_threads');
const resolve = require('../utils/pathResolver');
const path = require('path');

module.exports = async function logStats(cwd, opts) {
  const input = opts.input, output = opts.output;
  if (!input || !output) return console.log('Invalid input');
  const inPath = resolve(cwd, input), outPath = resolve(cwd, output);

  try {
    const stat = await fs.promises.stat(inPath);
    const size = stat.size;
    const cpus = os.cpus().length;
    const chunkSize = Math.ceil(size / cpus);

    // Find chunk boundaries (on line breaks)
    const positions = [0];
    const fd = await fs.promises.open(inPath, 'r');
    let pos = chunkSize;
    for (let i = 1; i < cpus; i++) {
      const buf = Buffer.alloc(1024);
      let found = false;
      while (!found && pos < size) {
        const { bytesRead } = await fd.read(buf, 0, 1024, pos);
        for (let j = 0; j < bytesRead; j++) {
          if (buf[j] === 10) { // '\n'
            positions.push(pos + j + 1);
            pos += j + 1;
            found = true;
            break;
          }
        }
        if (!found) pos += bytesRead;
      }
      if (!found) positions.push(size);
    }
    positions.push(size);

    // Spawn workers
    const results = await Promise.all(positions.slice(0, -1).map((start, i) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, '../workers/logWorker.js'), {
          workerData: {
            path: inPath,
            start,
            end: positions[i + 1] - 1
          }
        });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', code => {
          if (code !== 0) reject(new Error('Worker stopped with code ' + code));
        });
      });
    }));

    // Merge results
    const stats = {
      total: 0,
      levels: {},
      status: {},

      pathCounts: {},
      responseTimeSum: 0
    };
    for (const r of results) {
      stats.total += r.total;
      for (const [k, v] of Object.entries(r.levels)) stats.levels[k] = (stats.levels[k] || 0) + v;
      for (const [k, v] of Object.entries(r.status)) stats.status[k] = (stats.status[k] || 0) + v;
      for (const [k, v] of Object.entries(r.pathCounts)) stats.pathCounts[k] = (stats.pathCounts[k] || 0) + v;
      stats.responseTimeSum += r.responseTimeSum;
    }
    // Top paths
    const topPaths = Object.entries(stats.pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => ({ path, count }));

    const out = {
      total: stats.total,
      levels: stats.levels,
      status: stats.status,
      topPaths,
      avgResponseTimeMs: stats.total ? +(stats.responseTimeSum / stats.total).toFixed(2) : 0
    };
    await fs.promises.writeFile(outPath, JSON.stringify(out, null, 2));
  } catch {
    return console.log('Operation failed');
  }
};