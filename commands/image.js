const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { rename, log } = require('../lib/util.js');
const { size } = require('../lib/filters.js');

async function handler({ input, output, width, height, time, silent }) {
  const infile = path.resolve(input);
  const outfile = rename(infile, {
    output,
    suffix: `-${time.replace(/:/g, '.')}`,
    ext: '.png'
  });

  if (!silent) {
    log.info('input: ', infile);
    log.info('output:', outfile);
  }

  if (infile === outfile) {
    throw new Error('input and output are the same');
  }

  // seek before providing an input to bind the seek to the iput file itself
  // if provided after, it will bind to the output, converting the whole
  // input file before extracting the frame from the converted output (v slow)
  const cmd = `${silent ? '-v quiet' : ''} -ss ${time} -i "${infile}" -vframes 1 ${size({ width, height })} "${outfile}"`;

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
    })
    .option('width', {
      type: 'number',
      describe: 'the width of the output image'
    })
    .option('height', {
      type: 'number',
      describe: 'the height of the output image'
    })
    .option('silent', {
      type: 'boolean',
      default: false,
      describe: 'skip all logging'
    });
  },
  handler
};
