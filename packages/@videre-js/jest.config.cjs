module.exports = require('../../config/jest/jest.base.cjs')({
  plugins: {
    ts_jest: require('ts-jest')
  },
  config: {
    preset: 'ts-jest'
  }
})