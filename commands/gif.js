const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { rename, log } = require('../lib/util.js');

async function handler({ seek, duration, ...argv }) {
  const infile = path.resolve(argv.input);
  const outfile = rename(infile, {
    prefix: argv.prefix,
    suffix: argv.suffix,
    ext: '.gif'
  });

  log.info('input: ', infile);
  log.info('output:', outfile);

  if (infile === outfile) {
    throw new Error('input and output are the same');
  }

  const offsets = `${seek ? `-ss ${seek}` : ''} ${duration ? `-t ${duration}` : ''}`;

  // ffmpeg -ss 61.0 -t 2.5 -i in.mp4 -filter_complex "[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse" out.gif
  const cmd = `${offsets} -i "${infile}" -filter_complex "[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse" "${outfile}"`;

  await ffmpeg(cmd);
}

module.exports = {
  command: 'gif <input> [options]',
  describe: 'create a gif from a video',
  builder: function (yargs) {
    yargs
    .option('prefix', {
      type: 'string',
      alias: 'p',
      describe: 'prepend the output name'
    })
    .option('suffix', {
      type: 'string',
      alias: 's',
      describe: 'append the output name'
    })
    .option('seek', {
      type: 'number',
      default: 0,
      describe: 'start time for the gif, in seconds'
    })
    .option('duration', {
      type: 'number',
      describe: 'duration of the gif, in seconds'
    });
  },
  handler
};
