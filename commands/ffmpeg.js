const { ffmpeg } = require('../lib/ffmpeg.js');
const { log } = require('../lib/util.js');

async function handler() {
  const args = process.argv.slice(3).map(a => {
    return /[ =]/.test(a) ? `"${a}"` : a;
  }).join(' ');

  log.info(`ffmpeg ${args}`);

  // ignore errors, user can read the screen
  await ffmpeg(args).catch(() => {});
}

module.exports = {
  command: 'ffmpeg [options]',
  describe: 'ffmpeg passthrough',
  builder: function () {},
  handler
};
