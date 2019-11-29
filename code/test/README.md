![Module](https://img.shields.io/badge/%40platform-test-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/test.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/test)

![banner](https://user-images.githubusercontent.com/185555/69892775-ff12b300-136d-11ea-9b3b-bbc10651c6ad.png)

Configuration package containing test related modules.


## Install

    yarn add @platform/ts
    yarn add @platform/test

<p>&nbsp;<p>

## Commands
See [@platform/ts](../ts) for test related commands you may want to add to `package.json`:

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

Integration test commands:

```json
{
  "scripts: {
    "test:integration": "ts test --suffix INTEGRATION",
    "tddi": "ts test --suffix INTEGRATION --watch"
  }
}
```





<p>&nbsp;<p>
<p>&nbsp;<p>

