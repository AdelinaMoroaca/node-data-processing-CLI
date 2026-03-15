// src/workers/logWorker.js
const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');

(async () => {
  const { path, start, end } = workerData;
  const stream = fs.createReadStream(path, { start, end, encoding: 'utf8' });
  let leftover = '';
  const stats = {
    total: 0,
    levels: {},
    status: {},
    pathCounts: {},
    responseTimeSum: 0
  };
  for await (const chunk of stream) {
    let lines = (leftover + chunk).split('\n');
    leftover = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      const [ts, level, service, statusCode, respTime, method, path] = line.split(' ');
      stats.total++;
      stats.levels[level] = (stats.levels[level] || 0) + 1;
      const statusClass = statusCode[0] + 'xx';
      stats.status[statusClass] = (stats.status[statusClass] || 0) + 1;
      stats.pathCounts[path] = (stats.pathCounts[path] || 0) + 1;
      stats.responseTimeSum += Number(respTime);
    }
  }
  parentPort.postMessage(stats);
})();