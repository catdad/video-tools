const globby = require('globby');
const yargs = require('yargs');

const { log } = require('../lib/util.js');

function commandYargs(builder) {
  const originalArgv = process.argv.slice(4);
  const parser = yargs(originalArgv);

  if (builder) {
    builder(parser);
  }

  return parser.argv;
}

async function handler(argv) {
  const command = require(`./${argv.command}.js`);
  const files = (await globby(argv.globs)).sort();

  const commandArgv = commandYargs(command.builder);

  for (let file of files) {
    log.info('batch process:', file);

    try {
      await command.handler(Object.assign({}, commandArgv, {
        input: file
      }));
    } catch(e) {
      log.error(e);
    }

    log.info('-----------------------------------------------');
  }
}

module.exports = {
  command: 'batch <command> [globs..]',
  describe: 'execute any other command on a glob of files',
  handler
};
