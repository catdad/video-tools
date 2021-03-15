const path = require('path');

const { ffplay } = require('../lib/ffmpeg.js');

module.exports = {
  command: 'play <input>',
  describe: 'play a video file',
  builder: () => {},
  handler: async ({ input }) => {

    /* eslint-disable-next-line no-console */
    console.log(`
While playing:
  q, ESC              quit
  f                   toggle full screen
  p, SPC              pause
  m                   toggle mute
  9, 0                decrease and increase volume respectively
  /, *                decrease and increase volume respectively
  a                   cycle audio channel in the current program
  v                   cycle video channel
  t                   cycle subtitle channel in the current program
  c                   cycle program
  w                   cycle video filters or show modes
  s                   activate frame-step mode
  left/right          seek backward/forward 10 seconds
  down/up             seek backward/forward 1 minute
  page down/page up   seek backward/forward 10 minutes
  right mouse click   seek to percentage in file corresponding to fraction of width
  left double-click   toggle full screen
`);

    await ffplay(`-hide_banner -i "${path.resolve(input)}"`);
  }
};
