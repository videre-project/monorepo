# `config/jest`

```js
// package.json
{
  "scripts": {
    /*
     * Passthrough for running `yarn jest`
     * @example Run custom jest scripts:    `yarn jest clean`
     * @example Run regular jest commands:  `yarn jest -- file.test.ts`
     * @example Combine both:               `yarn jest watch -- file.test.ts`
     */
    "jest": "run g:config jest -d \"$(pwd)\" -- \"$@\""
  }
}
```
```js
// jest.config.cjs

/* for Javascript projects */
module.exports = require('../../config/jest/jest.base.cjs')({
  config: { /* Jest config properties here */ }
})

/* for Typescript projects */
module.exports = require('../../config/jest/jest.base.cjs')({
  config: {
    preset: 'ts-jest',
    // Jest config properties here
  },
  /**
   * Transpilation plugins for the base configuration to consume.
   * Supported plugins include:
   * - `ts-jest`
   */
  plugins: {
    ts_jest: require('ts-jest')
  },
  /**
   * You can optionally add a `hooks` property to control which scripts are
   * evaluated during the `globalSetup` and/or `globalTeardown` lifecycle.
   * 
   * This will by default match any runnable files ending with any of:
   * - `.setup.(js|ts|...)`   or `.globalSetup.(js|ts|...)`
   * - `.teardown.(js|ts|...) or `.globalTeardown.(js|ts|...)`
   */
  hooks: {
    globalSetup: [],   // can be a `string` or `string[]`
    globalTeardown: [] //
  }
})
```

You can optionally add a `hooks` property to control which scripts are evaluated
during the `globalSetup` and/or `globalTeardown` lifecycle.

```js
// jest.config.cjs

module.exports = require('../../config/jest/jest.base.cjs')({
  hooks: {
    globalSetup: [],   // can be a `string` or `string[]`
    globalTeardown: [] //
  }
})
```

This will by default match runnable files ending with any of:
- `.setup.(js|ts|...)` or `.globalSetup.(js|ts|...)`
- `.teardown.(js|ts|...)` or `.globalTeardown.(js|ts|...)`
