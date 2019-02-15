[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/electron.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/electron)
# @platform/electron
Common utilities for working with [electron](https://electronjs.org).

## Manual Test
To run an electron test shell, see the [electron-test](../electron-test/README.md) module:

```bash
cd electron-test
yarn ui start
```


## package.json
Optionally add a [browserslist](https://github.com/browserslist/browserslist) reference:
```json
{
  "browserslist": [
    "electron >= 4"
  ]
}
```
- https://www.npmjs.com/package/electron-to-chromium

## Polyfill
The `babel-polyfill` is included to ensure [Parcel](https://parceljs.org) bundles correctly without causing certain errors when building a production distribution, for example  this [issue](https://github.com/parcel-bundler/parcel/issues/871#issuecomment-367899522):

```
regeneratorRuntime is not defined 😩
```


<p>&nbsp;<p>
<p>&nbsp;<p>

