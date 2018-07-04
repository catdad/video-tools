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

  if (argv.dry) {
    log.info('batch process files:');
    log.info(files.join('\n'));

    return;
  }

  const commandArgv = commandYargs(command.builder);

  for (let file of files) {
    log.info('processing file:', file);

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
  builder: function (yargs) {
    yargs
    .option('dry', {
      type: 'boolean',
      describe: 'dry-run only, prints files without processing them',
      default: false
    });
  },
  handler
};
