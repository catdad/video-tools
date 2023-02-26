const path = require('path');
const shellton = require('shellton');

// in Electron, this module will always need to be unpacked
// electron-builder alraedy detects it automatically
// but we will need to fix the path so that it can find the binaries
const isElectron = 'electron' in process.versions;
const thisDir = isElectron ? __dirname.replace('app.asar', 'app.asar.unpacked') : __dirname;

const BIN_PATH = path.resolve(thisDir, '../bin');

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
