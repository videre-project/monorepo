module.exports = require('../../config/jest/jest.base.cjs')({
  config: {
    preset: 'ts-jest'
  },
  plugins: {
    ts_jest: require('ts-jest')
  }
})