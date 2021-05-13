const path = require('path');
const through = require('through2');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { rename, log } = require('../lib/util.js');
const { SYMBOL_RETURN_STDOUT } = require('../lib/symbols.js');

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

async function handler({ stdout, stderr, lut, input, output }) {
  let lib = false;

  if (output === SYMBOL_RETURN_STDOUT) {
    output = '-';
    lib = true;
  }

  const lutfile = lutPath(lut);
  const infile = path.resolve(input);
  const outfile = output ?
    path.resolve(output) :
    rename(infile, {
      suffix: `.${path.basename(lutfile)}`
    });

  if (output !== '-') {
    log.info('lut:   ', lutfile);
    log.info('input: ', infile);
    log.info('output:', outfile);
  }

  const data = [];

  let cmd = `-i "${infile}" -vf lut3d="${lutfile}" -movflags faststart`;

  if (output === '-') {
    stdout = through();
    stdout.on('data', chunk => lib ? data.push(chunk) : process.stdout.write(chunk));
    cmd += ` -f mjpeg -`;
  } else {
    cmd += ` "${outfile}"`;
  }

  await ffmpeg(cmd, { stdout, stderr });

  if (data.length) {
    return Buffer.concat(data);
  }
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
