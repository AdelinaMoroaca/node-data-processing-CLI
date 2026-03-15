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

      if (cmd === 'up') {
        cwd = navigation.up(cwd);
        console.log(`You are currently in ${cwd}`);
      }
      else if (cmd === 'cd') {
        if (args.length !== 1) {
          console.log('Invalid input');
        } else {
          const dir = args[0];
          const newCwd = await navigation.cd(cwd, dir);
          if (newCwd) {
            cwd = newCwd;
            console.log(`You are currently in ${cwd}`);
          } else {
            console.log('Operation failed');
          }
        }
      }
      else if (cmd === 'ls') {
        try {
          await navigation.ls(cwd);
          console.log(`You are currently in ${cwd}`);
        } catch {
          console.log('Operation failed');
        }
      }
      else if (commands[cmd]) {
        try {
          const opts = argParser(args);
          await commands[cmd](cwd, opts);
          console.log(`You are currently in ${cwd}`);
        } catch {
          console.log('Operation failed');
        }
      }
      else {
        console.log('Invalid input');
      }
    } catch (e) {
      console.log('Operation failed');
    }
    rl.prompt();
  });

  return new Promise((resolve) => {
    rl.on('close', () => {
      resolve();
    });
    rl.on('SIGINT', () => {
      rl.close();
    });
  });
};