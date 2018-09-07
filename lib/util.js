const path = require('path');
const util = require('util');

const chalk = require('chalk');

const log = (function () {
  function print(color, stream, ...args) {
    const str = util.format(...args);

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
  rename: function (filepath, opts) {
    var obj = path.parse(filepath);

    if (opts.output) {
      return path.join(obj.dir, path.basename(opts.output, opts.ext) + opts.ext);
    }

    var name = path.basename(obj.base, obj.ext);

    return path.join(obj.dir, `${opts.prefix || ''}${name}${opts.suffix || ''}${opts.ext || obj.ext}`);
  },
  readStream,
  log
};
