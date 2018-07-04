const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { setExt } = require('../lib/util.js');

async function handler(argv) {
  var infile = path.resolve(argv.input);
  var outfile = setExt(infile, argv.format);

  console.log('input: ', infile);
  console.log('output:', outfile);

  if (infile === outfile) {
    throw new Error('input and output are the same');
  }

  // ffmpeg -i %1 -vcodec copy -acodec copy -movflags faststart %2
  await ffmpeg(`-i "${infile}" -vcodec copy -acodec copy ${argv.format === 'mp4' ? '-movflags faststart' : ''} "${outfile}"`);
}

module.exports = {
  command: 'container <input> [options]',
  describe: 'switch format container without transcoding',
  builder: function (yargs) {
    yargs.option('format', {
      type: 'string',
      default: 'mp4'
    });
  },
  handler
};
