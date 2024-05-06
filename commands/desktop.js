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

function captureSerializer(os, { width, height, x, y, framerate, device }) {
  // https://trac.ffmpeg.org/wiki/Capture/Desktop

  // TODO implement encoding preset (e.g. ultrafast for slow CPUs)

  if (os === 'win') {
    const videoSize = isNumber(width * height) ?
      `-video_size ${width}x${height}` :
      '';

    return `-f gdigrab -framerate ${framerate} -offset_x ${x} -offset_y ${y} ${videoSize} -i desktop -c:v libx264 -pix_fmt yuv420p -movflags faststart`;
  }

  if (os === 'osx') {
    // Note: on Mac, we need to set the framerate twice:
    // * one for the source device (which screen capture ignores, but cameras need)
    // * one for output processing, which is required to not record at the default 1000k for screen capture

    // TODO add -c:v libx264

    const videoSize = isNumber(width * height) ?
      `-vf "crop=${width}:${height}:${x}:${y}"` :
      '';

    return `-f avfoundation -capture_cursor 1 -framerate ${framerate} -i ${device} -pix_fmt yuv420p -r ${framerate} ${videoSize} -movflags faststart`;
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

async function screenInfo({ os = OS, device, framerate } = {}) {
  const outStream = through();

  const command = (() => {
    if (os === 'win') {
      return `-f gdigrab -i desktop -y -f mjpeg -vframes 1 -`;
    }

    if (os === 'osx') {
      return `-f avfoundation -framerate ${framerate} -i ${device} -r ${framerate} -y -f mjpeg -vframes 1 -`;
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

async function screenRecord({ output = 'video-recording.mp4', os = OS, stdin, stdout, stderr, ...argv }) {
  const outfile = path.resolve('.', output);
  const cmd = `${captureSerializer(os, argv)} "${outfile}"`;

  log.info('output:', outfile);
  log.info(`ffmpeg ${cmd}`);

  await ffmpeg(`${cmd}`, { stdin, stdout, stderr });
}

async function handler({ ...argv }) {
  if (argv.list) {
    return listDevices({ ...argv });
  }

  if (argv.info) {
    const { width, height } = await screenInfo({ ...argv });
    log.info({ width: width, height: height, ext: 'jpeg' });
    return;
  }

  return screenRecord({
    ...argv,
  });
}

module.exports = {
  command: 'desktop [options]',
  describe: 'capture screen video',
  builder: function (yargs) {
    yargs
    .option('info', {
      type: 'boolean',
      default: false,
      describe: 'show screen size info without capturing video'
    })
    .option('list', {
      type: 'boolean',
      default: false
    })
    .option('output', {
      type: 'string',
      describe: 'the output file',
      alias: 'o'
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
    })
    .options('framerate', {
      type: 'number',
      describe: 'the video framerate',
      default: 30,
      alias: 'f'
    });

    if (process.platform === 'darwin' || true) {
      yargs.options('device', {
        type: 'number',
        describe: 'the video device to capture\nusually 1 on a MacBook\nrun `vid desktop --list` for more info',
        default: 1
      });
    }
  },
  handler
};
