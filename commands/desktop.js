const path = require('path');

const through = require('through2');
const Jimp = require('jimp');

const { ffmpeg } = require('../lib/ffmpeg.js');
const { log, readStream } = require('../lib/util.js');

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

function isNumber(val) {
  return Number(val) === val;
}

function captureSerializer(os, { width, height, x, y }) {
  // https://trac.ffmpeg.org/wiki/Capture/Desktop

  const videoSize = isNumber(width * height) ?
    `-video_size ${width}x${height} -show_region 1` :
    '';

  if (os === 'win') {
    return `-f gdigrab -framerate 30 -offset_x ${x} -offset_y ${y} ${videoSize} -i desktop`;
  }

  throw new Error(`${os.toUpperCase()} operating system capture is not implemented`);
}

function listSerializer(os) {
  if (os === 'win') {
    return `-list_devices true -f dshow -i dummy`;
  }

  throw new Error(`${os.toUpperCase()} operating system device list is not implemented`);
}

async function listDevices({ os = OS }) {
  await ffmpeg(listSerializer(os)).catch(() => {});
}

async function thumbnail() {
  const outStream = through();

  const [buff] = await Promise.all([
    readStream(outStream),
    ffmpeg(`-f gdigrab -i desktop -y -f mjpeg -vframes 1 -`, { stdout: outStream })
  ]);

  const img = await Jimp.read(buff);

  log.info({ width: img.bitmap.width, height: img.bitmap.height, ext: img.getExtension() });
}

async function handler({ list, thumb, output = 'video-recording.mp4', os = OS, ...argv }) {
  if (thumb) {
    return thumbnail();
  }

  const outfile = path.resolve('.', output);

  if (list) {
    return listDevices({ os });
  }

  log.info('output:', outfile);

  const cmd = `${captureSerializer(os, argv)} "${outfile}`;

  log.info(`ffmpeg ${cmd}`);

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
