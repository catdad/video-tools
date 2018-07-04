const path = require('path');

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
  }
};
