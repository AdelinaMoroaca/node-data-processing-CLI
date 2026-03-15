// src/commands/index.js
module.exports = {
  'csv-to-json': require('./csvToJson'),
  'json-to-csv': require('./jsonToCsv'),
  'count': require('./count'),
  'hash': require('./hash'),
  'hash-compare': require('./hashCompare'),
  'encrypt': require('./encrypt'),
  'decrypt': require('./decrypt'),
  'log-stats': require('./logStats'),
};