const path = require('path');
const { format } = require('util');

const chalk = require('chalk');

const log = (function () {
  function print(color, stream, ...args) {
    if (!process.env.VID_LOGGING) {
      return;
    }

    const str = format(...args);

    /* eslint-disable no-console */
    console[stream](color(str));
    /* eslint-enable no-console */
  }

  return {
    success: print.bind(null, chalk.green, 'log'),
    info: print.bind(null, chalk.cyan, 'log'),
    warn: print.bind(null, chalk.yellow, 'log'),
    error: print.bind(null, chalk.red, 'error')
  };
}());

const once = (func) => {
  let called = false;

  return (...args) => {
    if (called) {
      return;
    }

    called = true;
    func(...args);
  };
};

const readStream = (stream) => {
  const data = [];

  return new Promise((resolve, reject) => {
    stream.on('data', chunk => data.push(chunk));

    stream.on('error', err => reject(err));

    const onceDone = once(() => {
      resolve(Buffer.concat(data));
    });

    stream.on('end', onceDone);
    stream.on('finish', onceDone);
  });
};

module.exports = {
  setExt: function (filepath, ext) {
    var obj = path.parse(filepath);
    var name = path.basename(obj.base, obj.ext);

    obj.ext = `.${ext}`;
    obj.base = `${name}${obj.ext}`;

    return path.format(obj);
  },
  rename: function (filepath, { output, prefix = '', suffix = '', ext }) {
    var { dir: inDir, name: inName, ext: inExt } = path.parse(filepath);

    if (output) {
      const { dir: outDir, name: outName, ext: outExt } = path.parse(path.resolve(inDir, output));

      return path.join(outDir, `${outName}${outExt || ext || inExt}`);
    }

    return path.join(inDir, `${prefix}${inName}${suffix}${ext || inExt}`);
  },
  readStream,
  log
};
