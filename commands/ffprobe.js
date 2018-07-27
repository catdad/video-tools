const { ffprobe } = require('../lib/ffmpeg.js');
const { log } = require('../lib/util.js');

async function handler() {
  const args = process.argv.slice(3).join(' ');

  log.info(`ffprobe ${args}`);

  // ignore errors, user can read the screen
  await ffprobe(args).catch(() => {});
}

module.exports = {
  command: 'ffprobe [options]',
  describe: 'ffprode passthrough',
  builder: function () {},
  handler
};
