const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { rename, log } = require('../lib/util.js');

function serializeFilter({ framerate = 10, scale = 480, quality = 'low' }) {
  let str = `[0:v] fps=${framerate},scale=${scale}:-1,split [a][b]`;

  if (quality === 'high') {
    // generate one color palette per frame
    return `${str};[a] palettegen=stats_mode=single [p];[b][p] paletteuse=new=1`;
  }

  // generate one color palette for the whole gif
  return `${str};[a] palettegen [p];[b][p] paletteuse`;
}

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
  const filter = serializeFilter({ ...argv });

  // ffmpeg -ss 61.0 -t 2.5 -i in.mp4 -filter_complex "[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse" out.gif
  const cmd = `${offsets} -i "${infile}" -filter_complex "${filter}" "${outfile}"`;

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
    .option('output', {
      type: 'string',
      alias: 'o',
      describe: 'the output name'
    })
    .option('seek', {
      type: 'number',
      default: 0,
      describe: 'start time for the gif, in seconds'
    })
    .option('duration', {
      type: 'number',
      describe: 'duration of the gif, in seconds',
      alias: 't'
    })
    .option('framerate', {
      type: 'number',
      describe: 'the gif framerate',
      default: 10,
      alias: 'fps'
    })
    .option('scale', {
      type: 'number',
      describe: 'the width of the gif',
      default: 480
    });
  },
  handler
};
