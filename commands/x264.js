const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { rename, log } = require('../lib/util.js');

function codecs(opts) {
  const v = 'libx264';
  const a = 'libmp3lame';

  switch(true) {
    case opts.v && opts.a:
    case !opts.v && !opts.a:
      return `-vcodec ${v} -acodec ${a}`;
    case opts.v:
      return `-vcodec ${v} -acodec copy`;
    case opts.a:
      return `-vcodec copy -acodec ${a}`;
  }

  throw new Error('bad codec options');
}

async function handler(argv) {
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

  // ffmpeg -i %1 -vcodec libx264 -acodec libmp3lame -movflags faststart -threads 2 %2
  const cmd = `-i "${infile}" ${codecs(argv)} -movflags faststart -threads ${Math.floor(argv.threads)} "${outfile}"`;

  await ffmpeg(cmd);
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
    .option('threads', {
      type: 'number',
      alias: 't',
      describe: 'number of threads to use for transcoding',
      default: 2
    });
  },
  handler
};
