![Module](https://img.shields.io/badge/%40platform-ts-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/ts.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/ts)

# @platform/ts

[TypesScript](https://www.typescriptlang.org) build, prepare and publish toolchain.

Provides:

- Command line for building, linting, preparing for publish and ultimately publishing.
- Produces CommonJS and modern ESM transpiled builds.
- Publishes to NPM from the distribution older, removing unnecesary pathing into the module from consumers (eg. '@my-modules/lib/...` is avoided).




## Commands
Adds the `ts` command to your module's `bin`. You can optionally use the following scripts in you `package.json`:

```json
{
  "scripts: {
    "test": "ts test",
    "tdd": "ts test --watch",
    "lint": "ts lint",
    "build": "ts build",
    "prepare": "ts prepare",
  }
}
```

## ESModules
When setting the `main` of package.json make sure to not include the `.js` file extensions allowing environments that as using [ESModule's](https://developers.google.com/web/fundamentals/primers/modules) to infer the `.msj` version.

```json
{
  "name": "my-module",
  "main": "index",
  "types": "index.d.ts"
}
```




## References:

- **ECMAScript Modules** (ESM)
  - [Using JavaScript modules on the web](https://developers.google.com/web/fundamentals/primers/modules) - Google/Primer
  - [ECMAScript modules in Node.js: the new plan](http://2ality.com/2018/12/nodejs-esm-phases.html) - December 2018
  - [ES6 Modules Today With TypeScript](https://www.ceriously.com/blog/post.php?id=2017-10-16-es6-modules-today-with-typescript.md) - recipe used.

