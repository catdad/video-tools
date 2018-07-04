const path = require('path');

const { ffprobe } = require('../lib/ffmpeg.js');

async function handler(argv) {
  const infile = path.resolve(argv.input);

  await ffprobe(`"${infile}"`);
}

module.exports = {
  command: 'info <input>',
  describe: 'show ffprobe info',
  handler
};
