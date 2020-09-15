const path = require('path');

const { ffprobe } = require('../lib/ffmpeg.js');

module.exports = {
  command: 'info <input>',
  describe: 'show ffprobe info',
  builder: () => {},
  handler: async ({ input }) => await ffprobe(`"${path.resolve(input)}"`)
};
