const path = require('path');

const root = require('rootrequire');
const shellton = require('shellton');

const BIN_PATH = path.resolve(root, 'bin/ffmpeg');

function ffmpeg(command) {
  return new Promise(function (resolve, reject) {
    shellton({
      task: `ffmpeg ${command}`,
      env: {
        PATH: BIN_PATH
      },
      stdout: process.stdout,
      stderr: process.stderr
    }, function (err) {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

module.exports = {
  ffmpeg
};
