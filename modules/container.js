const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');

async function handler(argv) {
  var infile = path.resolve(argv.input);
  var outfile = (function (obj, format = 'mp4') {
    var name = path.basename(obj.base, obj.ext);

    obj.ext = `.${format}`;
    obj.base = `${name}${obj.ext}`;

    return path.format(obj);
  }(path.parse(infile), argv.format));

  console.log('input:', infile);
  console.log('output:', outfile);

  if (infile === outfile) {
    throw new Error('input and output are the same');
  }

  // ffmpeg -i %1 -vcodec copy -acodec copy -movflags faststart %2
  await ffmpeg(`-i "${infile}" -vcodec copy -acodec copy ${argv.format === 'mp4' ? '-movflags faststart' : ''} "${outfile}"`);
}

module.exports = {
  command: 'container [options] <input>',
  describe: 'switch format container without transcoding',
  handler
};
