const path = require('path');

const root = require('rootrequire');
const shellton = require('shellton');

const BIN_PATH = path.resolve(root, 'bin/ffmpeg');

function spawn(task, { stdin = 'inherit', stdout = 'inherit', stderr = 'inherit' } = { stdin: 'inherit', stdout: 'inherit', stderr: 'inherit' }) {
  return new Promise(function (resolve, reject) {
    shellton({
      task,
      env: {
        PATH: BIN_PATH
      },
      stdin,
      stdout,
      stderr,
    }, function (err) {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

function ffmpeg(command, ...args) {
  return spawn(`ffmpeg ${command}`, ...args);
}

function ffprobe(command, ...args) {
  return spawn(`ffprobe ${command}`, ...args);
}

module.exports = {
  ffmpeg, ffprobe
};
