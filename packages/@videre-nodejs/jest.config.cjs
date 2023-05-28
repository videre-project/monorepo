module.exports = require('../../config/jest/jest.base.cjs')({
  plugins: {
    ts_jest: require('ts-jest')
  },
  config: {
    preset: 'ts-jest',
    modulePathIgnorePatterns: [
      '.*\.(collection|catalog)\.(lz4|json)$'
    ],
  },
  hooks: {
    globalSetup: {
      include: '__mock__[\\\\?|/]+index\.ts'
    },
    globalTeardown: {
      include: '__mock__[\\\\?|/]+index\.ts'
    }
  }
})