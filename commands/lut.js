const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { rename, log } = require('../lib/util.js');

function lutPath(file) {
  const filepath = path.resolve(file);

  if (path === path.posix) {
    return filepath;
  }

  // ffmpeg on Windows is weird when it comes to slashes
  // in the lut3d filter parameter...
  // https://lists.ffmpeg.org/pipermail/ffmpeg-user/2015-May/026516.html
  // lut3d="C\\:\\\\Path\\\\To\\\\filename.cube"
  return filepath
  .replace(/\\/g, '\\\\\\\\')
  .replace(':', '\\\\:');
}

async function handler(argv) {
  const lutfile = lutPath(argv.lut);
  const infile = path.resolve(argv.input);
  const outfile = argv.out ?
    path.resolve(argv.out) :
    rename(infile, {
      suffix: `.${path.basename(lutfile)}`
    });

  log.info('lut:   ', lutfile);
  log.info('input: ', infile);
  log.info('output:', outfile);

  await ffmpeg(`-i "${infile}" -vf lut3d="${lutfile}" -movflags faststart "${outfile}"`);
}

module.exports = {
  command: 'lut <input>',
  describe: 'apply a LUT to a video or image',
  builder: function (yargs) {
    yargs
    .option('lut', {
      type: 'string',
      describe: 'the LUT file to use'
    })
    .option('out', {
      type: 'string',
      describe: 'where to write the file'
    })
  },
  handler
};
