const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { rename, log } = require('../lib/util.js');

async function handler({ input, format, stdout, stderr, ...argv }) {
  const infile = path.resolve(input);
  const outfile = rename(infile, {
    ext: `.${format}`,
    ...argv
  });

  log.info('input: ', infile);
  log.info('output:', outfile);

  if (infile === outfile) {
    throw new Error('input and output are the same');
  }

  // ffmpeg -i %1 -vcodec copy -acodec copy -movflags faststart %2
  const cmd = `-i "${infile}" -vcodec copy -acodec copy ${format === 'mp4' ? '-movflags faststart' : ''} "${outfile}"`;

  await ffmpeg(cmd, { stdout, stderr });
}

module.exports = {
  command: 'container <input> [options]',
  describe: 'switch format container without transcoding',
  builder: function (yargs) {
    yargs
    .option('format', {
      type: 'string',
      default: 'mp4'
    })
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
    });
  },
  handler
};
