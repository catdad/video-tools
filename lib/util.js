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
    var name = path.basename(obj.base, obj.ext);

    return path.join(obj.dir, `${opts.prefix || ''}${name}${opts.suffix || ''}${opts.ext || obj.ext}`);
  },
  log
};
