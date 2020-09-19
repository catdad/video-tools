const path = require('path');

const meta = require('../lib/meta.js');
const { log } = require('../lib/util.js');

module.exports = {
  command: 'meta <input>',
  describe: 'print metadata json',
  builder: () => {},
  handler: async ({ input }) => {
    const result = await meta(path.resolve(input));

    log.info(result);

    return result;
  }
};
