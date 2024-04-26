const path = require('path');

const through = require('through2');
const JPEG = require('jpeg-js');

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

  if (os === 'win') {
    return `-f gdigrab -framerate 30 -offset_x ${x} -offset_y ${y} -video_size ${width}x${height} -i desktop`;
  }

  if (os === 'osx') {
    // TODO it's not always device 1
    
    return `-f avfoundation -capture_cursor 1 -i 1 -pix_fmt yuv420p -r 30 -vf "crop=${width}:${height}:${x}:${y}"`;
    // return `-f avfoundation -i 1 -pix_fmt yuv420p -r 30 -vf "crop=${width}:${height}:${x}:${y}, scale=600:-1"`;
  }

  throw new Error(`${os.toUpperCase()} operating system capture is not implemented`);
}

function listSerializer(os) {
  if (os === 'win') {
    return `-list_devices true -f dshow -i dummy`;
  }

  if (os === 'osx') {
    return `-list_devices true -f avfoundation -i ""`;
  }

  throw new Error(`${os.toUpperCase()} operating system device list is not implemented`);
}

async function listDevices({ os = OS }) {
  await ffmpeg(listSerializer(os)).catch(() => {});
}

async function screenInfo({ os = OS } = {}) {
  const outStream = through();

  const command = (() => {
    if (os === 'win') {
      return `-f gdigrab -i desktop -y -f mjpeg -vframes 1 -`;
    }

    if (os === 'osx') {
      return `-f avfoundation -i 1 -y -f mjpeg -vframes 1 -`;
    }

    throw new Error(`${os.toUpperCase()} operating system screen info is not implemented`);
  })();

  const [buff] = await Promise.all([
    readStream(outStream),
    ffmpeg(command, { stdout: outStream })
  ]);

  const { width, height } = JPEG.decode(buff);

  return { width, height };
}

async function screenRecord({ output = 'video-recording.mp4', os = OS, ...argv }) {
  const outfile = path.resolve('.', output);
  const cmd = `${captureSerializer(os, argv)} "${outfile}"`;

  log.info('output:', outfile);
  log.info(`ffmpeg ${cmd}`);

  await ffmpeg(`${cmd}`);
}

async function handler({ ...argv }) {
  if (argv.list) {
    return listDevices({ ...argv });
  }

  const { width, height } = await screenInfo({ ...argv });

  if (argv.info) {
    log.info({ width: width, height: height, ext: 'jpeg' });
    return;
  }

  return screenRecord({
    width: width - argv.x,
    height: height - argv.y,
    ...argv
  });
}

module.exports = {
  command: 'desktop [options]',
  describe: 'capture screen video',
  builder: function (yargs) {
    yargs
    .option('output', {
      type: 'string',
      describe: 'the output file',
      alias: 'o'
    })
    .option('info', {
      type: 'boolean',
      default: false,
      describe: 'show screen size info without capturing video'
    })
    .option('list', {
      type: 'boolean',
      default: false
    })
    .option('width', {
      type: 'number',
      alias: 'w',
      describe: 'width of the capture area'
    })
    .option('height', {
      type: 'number',
      alias: 'h',
      describe: 'height of the capture area'
    })
    .options('offsetX', {
      type: 'number',
      alias: 'x',
      default: 0,
      describe: 'x-axis offset for the capture area'
    })
    .options('offsetY', {
      type: 'number',
      alias: 'y',
      default: 0,
      describe: 'y-axis offset for the capture area'
    });
  },
  handler
};
