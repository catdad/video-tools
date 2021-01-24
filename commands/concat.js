const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const tempy = require('tempy');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { rename, log } = require('../lib/util.js');

async function handler({ format, stdout, stderr, _: files, ...argv }) {
  const infile = tempy.file();
  const intxt = files.slice(1)
    .map(f => path.resolve(f))
    .map(f => f.replace(/'/g, `\\'`))
    .map(f => `file '${f}'`)
    .join('\n');

  await promisify(fs.writeFile)(infile, intxt);

  const outrel = path.resolve('test.mp4');
  const outfile = rename(outrel, {
    ext: `.${format}`,
    ...argv
  });

  log.info('------------------------------------------');
  log.info(intxt);
  log.info('------------------------------------------');
  log.info('output:', outfile);

  if (infile === outfile) {
    throw new Error('input and output are the same');
  }

  const cmd = `-f concat -safe 0 -i "${infile}" ${format === 'mp4' ? '-movflags faststart' : ''} "${outfile}"`;

  await ffmpeg(cmd, { stdout, stderr });

  await fs.unlink(infile);
}

module.exports = {
  command: 'concat',
  describe: 'combine multiple videos into one without transcoding',
  builder: function (yargs) {
    yargs
    .usage('$0 concat [options] input1 input2 ... inputN')
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
      describe: 'the output name',
      default: 'output'
    });
  },
  handler
};
