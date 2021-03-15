const { ffplay } = require('../lib/ffmpeg.js');
const { log } = require('../lib/util.js');

async function handler() {
  const args = process.argv.slice(3).map(a => `"${a}"`).join(' ');

  log.info(`ffprobe ${args}`);

  // ignore errors, user can read the screen
  await ffplay(args).catch(() => {});
}

module.exports = {
  command: 'ffplay [options]',
  describe: 'ffplay passthrough',
  builder: function () {},
  handler
};
