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

async function handler({ command, globs, dry }) {
  const { builder, handler } = require(`./${command}.js`);

  const files = (await globby(globs)).sort((a, b) => {
    return a.localeCompare(b);
  });

  if (dry) {
    log.info('batch process files:');
    log.info(files.join('\n'));

    return;
  }

  const commandArgv = commandYargs(builder);

  for (let file of files) {
    log.info('processing file:', file);

    try {
      await handler(Object.assign({}, commandArgv, {
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
