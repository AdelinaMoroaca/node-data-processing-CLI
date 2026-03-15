// src/main.js
const os = require('os');
const repl = require('./repl');

async function main() {
  const homeDir = os.homedir();
  console.log('Welcome to Data Processing CLI!');
  console.log(`You are currently in ${homeDir}`);
  await repl(homeDir);
  // This will be printed on exit from repl
  console.log('Thank you for using Data Processing CLI!');
}

main();