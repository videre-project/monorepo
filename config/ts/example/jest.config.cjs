const baseConfig = require('../../config/ts/jest.base.cjs')(__filename, {
  tsconfig: require('./tsconfig'),
  ts_jest: require('ts-jest')
});

module.exports = baseConfig;