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

async function handler({ lut, input, output }) {
  const lutfile = lutPath(lut);
  const infile = path.resolve(input);
  const outfile = output ?
    path.resolve(output) :
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
      alias: 'l',
      describe: 'the LUT file to use'
    })
    .option('output', {
      type: 'string',
      alias: 'o',
      describe: 'the output name'
    })
  },
  handler
};
