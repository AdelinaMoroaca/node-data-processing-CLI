const os = require('os');
const repl = require('./repl');

async function main() {
  const homeDir = os.homedir();
  console.log('Welcome to Data Processing CLI!');
  console.log(`You are currently in ${homeDir}`);
  await repl(homeDir);
  console.log('Thank you for using Data Processing CLI!');
}

main();