const fs = require('fs');
const path = require('path');

const commandsDir = path.resolve(__dirname, 'commands');

const commands = fs.readdirSync(commandsDir)
  .filter(f => /\.js$/.test(f))
  .map(f => ({ name: f.replace(/\.js$/, ''), path: path.resolve(commandsDir, f) }))
  .map(obj => ({ ...require(obj.path), ...obj }));

const map = commands.reduce((obj, { name, builder }) => ({ ...obj, [name]: builder }), {});

module.exports = { commands, map };
