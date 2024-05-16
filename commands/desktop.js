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
      return platform;
  }
}(process.platform))

function isNumber(val) {
  return Number(val) === val;
}

function scaleSerializer(maxWidth, maxHeight) {
  const def = -2;
  const width = maxWidth ? `'min(${maxWidth},iw)'` : def;
  const height = maxHeight ? `'min(${maxHeight},ih)'` : def;

  if (width === def && height === def) {
    return null;
  }

  return `scale=${width}:${height}`;
}

function captureSerializer(os, { width, height, x, y, framerate, device, maxWidth, maxHeight }) {
  // https://trac.ffmpeg.org/wiki/Capture/Desktop

  // TODO implement encoding preset (e.g. ultrafast for slow CPUs)

  if (os === 'win') {
    const videoSize = isNumber(width * height) ?
      `-video_size ${width}x${height}` :
      '';

    const scale = scaleSerializer(maxWidth, maxHeight);

    return `-f gdigrab -framerate ${framerate} -offset_x ${x} -offset_y ${y} ${videoSize} -i desktop ${scale ? `-vf "${scale}"` : ''} -c:v libx264 -pix_fmt yuv420p -movflags faststart`;
  }

  if (os === 'osx') {
    // Note: on Mac, we need to set the framerate twice:
    // * one for the source device (which screen capture ignores, but cameras need)
    // * one for output processing, which is required to not record at the default 1000k for screen capture

    // TODO add -c:v libx264

    const crop = isNumber(width * height) ? `crop=${width}:${height}:${x}:${y}` : null;
    const scale = scaleSerializer(maxWidth, maxHeight);
    const effects = [crop, scale].filter(n => !!n).join(', ');

    const vf = effects ? `-vf "${effects}"` : '';

    return `-f avfoundation -capture_cursor 1 -framerate ${framerate} -i ${device} -r ${framerate} ${vf} -pix_fmt yuv420p -movflags faststart`;
  }

  throw new Error(`${os.toUpperCase()} operating system capture is not implemented`);
}

function listSerializer(os) {
  if (os === 'win') {
    return `-hide_banner -list_devices true -f dshow -i dummy`;
  }

  if (os === 'osx') {
    return `-hide_banner -list_devices true -f avfoundation -i ""`;
  }

  throw new Error(`${os.toUpperCase()} operating system device list is not implemented`);
}

async function listDevices({ os = OS, stdin, stdout, stderr }) {
  await ffmpeg(listSerializer(os), {
    stdin,
    stdout,
    stderr
  }).catch(() => {});
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

  if (argv.dry) {
    return;
  }

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
    .option('max-width', {
      type: 'number',
      describe: 'width to scale the video down to'
    })
    .option('max-height', {
      type: 'number',
      describe: 'height to scale the video down to'
    })
    .options('framerate', {
      type: 'number',
      describe: 'the video framerate',
      default: 30,
      alias: 'f'
    })
    .options('dry', {
      type: 'boolean',
      default: false,
      describe: 'print generated command without running it'
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
