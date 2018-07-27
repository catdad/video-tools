const path = require('path');

const root = require('rootrequire');
const shellton = require('shellton');

const BIN_PATH = path.resolve(root, 'bin/ffmpeg');

function spawn(task) {
  return new Promise(function (resolve, reject) {
    shellton({
      task,
      env: {
        PATH: BIN_PATH
      },
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit'
    }, function (err) {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

function ffmpeg(command) {
  return spawn(`ffmpeg ${command}`);
}

function ffprobe(command) {
  return spawn(`ffprobe ${command}`);
}

module.exports = {
  ffmpeg, ffprobe
};
