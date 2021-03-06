const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');
const meta = require('../lib/meta.js');
const { rename, log } = require('../lib/util.js');

function codecs(opts) {
  const v = 'libx264';
  const a = 'libmp3lame';

  switch(true) {
    case opts.video && opts.audio:
    case !opts.video && !opts.audio:
      return `-vcodec ${v} -acodec ${a}`;
    case opts.video:
      return `-vcodec ${v} -acodec copy`;
    case opts.audio:
      return `-vcodec copy -acodec ${a}`;
  }

  throw new Error('bad codec options');
}

function size(argv) {
  const def = -2;
  const width = argv.width ? `'min(${argv.width},iw)'` : def;
  const height = argv.height ? `'min(${argv.height},ih)'` : def;

  if (width === def && height === def) {
    return '';
  }

  return `-vf scale=${width}:${height}`;
}

async function rateAsync(argv, infile) {
  if (!argv.framerate) {
    return '';
  }

  let fps;

  // find current frame rate
  try {
    const { video: vmeta } = await meta(infile);
    fps = eval(vmeta.r_frame_rate);
  } catch (e) {
    log.error('could not calculate framerate:', e);
    return '';
  }

  // allow setting lower framerate but not higher
  if (fps < argv.framerate) {
    return '';
  }

  return `-r ${argv.framerate}`;
}

async function handler({ stdout, stderr, ...argv }) {
  const infile = path.resolve(argv.input);
  const outfile = rename(infile, {
    prefix: argv.prefix,
    suffix: argv.suffix,
    ext: '.mp4'
  });

  log.info('input: ', infile);
  log.info('output:', outfile);

  if (infile === outfile) {
    throw new Error('input and output are the same');
  }

  const framerate = await rateAsync(argv, infile);

  // ffmpeg -i %1 -vcodec libx264 -acodec libmp3lame -movflags faststart -threads 2 %2
  const cmd = `-i "${infile}" ${codecs(argv)} ${size(argv)} ${framerate} -movflags faststart -threads ${Math.floor(argv.threads)} "${outfile}"`;

  await ffmpeg(cmd, { stdout, stderr });
}

module.exports = {
  command: 'x264 <input> [options]',
  describe: 'transcode video to x264 mp4',
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
    .option('video', {
      type: 'boolean',
      alias: 'v',
      describe: 'convert only video',
      default: false
    })
    .option('audio', {
      type: 'boolean',
      alias: 'a',
      describe: 'convert only audio',
      default: false
    })
    .option('width', {
      type: 'number',
      alias: 'w',
      describe: 'the desired video width'
    })
    .option('height', {
      type: 'number',
      alias: 'h',
      describe: 'the desired video height'
    })
    .option('framerate', {
      type: 'number',
      alias: 'f',
      describe: 'the desired video frame rate'
    })
    .option('threads', {
      type: 'number',
      alias: 't',
      describe: 'number of threads to use for transcoding',
      default: 2
    });
  },
  handler
};
