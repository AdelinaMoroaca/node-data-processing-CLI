// src/repl.js
const readline = require('readline');
const navigation = require('./navigation');
const commands = require('./commands');
const argParser = require('./utils/argParser');

module.exports = async function repl(startDir) {
  let cwd = startDir;
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (input === '.exit') {
      rl.close();
      return;
    }
    try {
      const [cmd, ...args] = input.split(' ');
      // Navigation commands
      if (cmd === 'up') {
        const newCwd = navigation.up(cwd);
        cwd = newCwd;
        console.log(`You are currently in ${cwd}`);
      } else if (cmd === 'cd') {
        const dir = args[0];
        if (!dir) {
          console.log('Invalid input');
        } else {
          const newCwd = await navigation.cd(cwd, dir);
          if (newCwd) {
            cwd = newCwd;
            console.log(`You are currently in ${cwd}`);
          } else {
            console.log('Operation failed');
          }
        }
      } else if (cmd === 'ls') {
        await navigation.ls(cwd);
      }
      // Data processing commands
      else if (commands[cmd]) {
        const opts = argParser(args);
        await commands[cmd](cwd, opts);
        console.log(`You are currently in ${cwd}`);
      } else {
        console.log('Invalid input');
      }
    } catch (e) {
      console.log('Operation failed');
    }
    rl.prompt();
  });

  rl.on('close', () => {
    // Exit message is handled in main.js after repl resolves
    process.exit(0);
  });

  rl.on('SIGINT', () => {
    rl.close();
  });
};