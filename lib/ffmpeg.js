const path = require('path');

const root = require('rootrequire');
const shellton = require('shellton');

const BIN_PATH = path.resolve(root, 'bin');

function spawn(task, { stdin = 'inherit', stdout = 'inherit', stderr = 'inherit' } = {}) {
  return new Promise(function (resolve, reject) {
    shellton({
      task,
      env: {
        PATH: BIN_PATH
      },
      stdin,
      stdout,
      stderr,
    }, function (err, stdout, stderr) {
      if (err) {
        return reject(err);
      }

      return resolve({ stdout, stderr });
    });
  });
}

function ffmpeg(command, ...args) {
  return spawn(`ffmpeg ${command}`, ...args);
}

function ffprobe(command, ...args) {
  return spawn(`ffprobe ${command}`, ...args);
}

function ffplay(command, ...args) {
  return spawn(`ffplay ${command}`, ...args);
}

module.exports = {
  ffmpeg, ffprobe, ffplay
};
