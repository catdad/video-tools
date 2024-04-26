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

  const videoSize = isNumber(width * height) ?
    `-video_size ${width}x${height} -show_region 1` :
    '';

  if (os === 'win') {
    return `-f gdigrab -framerate 30 -offset_x ${x} -offset_y ${y} ${videoSize} -i desktop`;
  }

  if (os === 'osx') {
    // TODO it's not always device 1
    
    // -vf "crop=out_w:out_h:x:y"
    console.log({ x, y, width, height });

    return `-f avfoundation -i 1 -pix_fmt yuv420p -framerate 30 -vf "crop=400:400:100:100"`;
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

  log.info({ width: width, height: height, ext: 'jpeg' });
}

async function screenRecord({ output = 'video-recording.mp4', os = OS, ...argv }) {
  const outfile = path.resolve('.', output);
  const cmd = `${captureSerializer(os, argv)} "${outfile}"`;

  log.info('output:', outfile);
  log.info(`ffmpeg ${cmd}`);

  await ffmpeg(`${cmd}`);
}

async function handler({ ...argv }) {
  if (argv.info) {
    return screenInfo();
  }

  if (argv.list) {
    return listDevices({ ...argv });
  }

  return screenRecord({ ...argv });
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
