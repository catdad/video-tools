const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { rename, log } = require('../lib/util.js');

async function handler(argv) {
  const infile = path.resolve(argv.input);
  const outfile = rename(infile, {
    ext: '.png'
  });

  log.info('input: ', infile);
  log.info('output:', outfile);

  if (infile === outfile) {
    throw new Error('input and output are the same');
  }

  const cmd = `-ss ${argv.time} -i "${infile}" -vframes 1 "${outfile}"`;

  await ffmpeg(cmd);
}

module.exports = {
  command: 'image <input> [options]',
  describe: 'extract still image from video',
  builder: function (yargs) {
    yargs
    .option('time', {
      type: 'string',
      alias: 't',
      describe: 'the timestamp for the image, hh:mm:ss.000',
      demand: 'a timestamp is required'
    })
    .option('output', {
      type: 'string',
      alias: 'o',
      describe: 'the output name'
    });
  },
  handler
};
