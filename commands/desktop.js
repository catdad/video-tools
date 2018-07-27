const path = require('path');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { log } = require('../lib/util.js');

const OS = (function (platform) {
  switch (platform) {
    case 'win32':
      return 'win';
    case 'darwin':
      return 'osx';
    default:
      return 'linux';
  }
}(process.platform))

async function listDevices({ os = OS }) {
  const cmd = os === 'win' ?
    `-list_devices true -f dshow -i dummy` : '';

  await ffmpeg(cmd).catch(() => {});
}

async function handler({ list, output = 'video-recording.mp4', os = OS, ...argv }) {
  const outfile = path.resolve('.', output);

  if (list) {
    return listDevices({ os });
  }

  log.info('output:', outfile);

  const videoSize = argv.width && argv.height ?
    `-video_size ${argv.width}x${argv.height} -show_region 1` :
    '';

  let cmd = os === 'win' ?
    `-f gdigrab -framerate 30 -offset_x ${argv.x} -offset_y ${argv.y} ${videoSize} -i desktop` :
    '';

  cmd += ` "${outfile}`;

  log.info(`ffmpeg ${cmd}`);

  // https://trac.ffmpeg.org/wiki/Capture/Desktop
  await ffmpeg(`${cmd}`);
}

module.exports = {
  command: 'desktop [options]',
  describe: 'switch format container without transcoding',
  builder: function (yargs) {
    yargs
    .option('output', {
      type: 'string',
      describe: 'the output file',
      alias: 'o'
    })
    .option('list', {
      type: 'boolean',
      default: false
    })
    .option('width', {
      type: 'number',
      alias: 'w'
    })
    .option('height', {
      type: 'number',
      alias: 'h'
    })
    .options('offsetX', {
      type: 'number',
      alias: 'x',
      default: 0
    })
    .options('offsetY', {
      type: 'number',
      alias: 'y',
      default: 0
    });
  },
  handler
};
