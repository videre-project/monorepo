# `config/tsc`

```js
// package.json
{
  "scripts": {
    /*
     * Passthrough for running `yarn tsc`
     * @example Run custom tsc scripts:     `yarn tsc clean`
     * @example Run regular tsc commands:   `yarn tsc --target ES5`
     * @example Combine both:               `yarn tsc watch --target ES5`
     */
    "tsc": "run g:config tsc -d \"$(pwd)\" -- \"$@\""
  }
}
```
```js
// tsconfig.json
{
  "extends": "../../config/tsc/tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "build"
  },
  "include": ["src"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```
