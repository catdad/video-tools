const fs = require('fs');
const path = require('path');

const commandsDir = path.resolve(__dirname, 'commands');
const commands = fs.readdirSync(commandsDir)
  .filter(f => /\.js$/.test(f))
  .map(f => path.resolve(commandsDir, f))
  .map(f => require(f));

module.exports = commands;
