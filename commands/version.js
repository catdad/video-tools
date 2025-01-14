const pkg = require('../package.json');
const { ffmpeg, ffprobe } = require('../lib/ffmpeg.js');

const getVersion = str => str.trim().split('\n')[0].trim();

module.exports = {
  command: 'version',
  describe: 'show ffmpeg and ffprobe versions',
  builder: (yargs) => yargs.option('silent', {
    type: 'boolean',
    describe: 'execute command without printing to console',
    default: false
  }),
  handler: async ({ silent }) => {
    const { stdout: ffprobeOut } = await ffprobe('-version', { stdout: null, stderr: null });
    const { stdout: ffmpegOut } = await ffmpeg('-version', { stdout: null, stderr: null });

    const libVersion = `${pkg.name} version ${pkg.version} ${pkg.homepage} Copyright (c) ${pkg.author}`;
    const ffmpegVersion = getVersion(ffmpegOut);
    const ffprobeVersion = getVersion(ffprobeOut);

    if (!silent) {
      console.log(libVersion);
      console.log(ffmpegVersion);
      console.log(ffprobeVersion);
    }

    return { libVersion, ffmpegVersion, ffprobeVersion };
  }
};
