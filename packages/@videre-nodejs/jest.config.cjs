module.exports = require('../../config/jest/jest.base.cjs')({
  config: {
    preset: 'ts-jest',
    modulePathIgnorePatterns: ['.*\.(collection|catalog)\.(lz4|json)$'],
  },
  plugins: {
    ts_jest: require('ts-jest')
  },
  hooks: ['globalSetup', 'globalTeardown']
    .reduce((acc, hook) => {
      acc[hook] = { include: '__mock__[\\\\?|/]+index\.ts' };
      return acc;
    }, {})
})