![Module](https://img.shields.io/badge/%40platform-electron-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/electron.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/electron)
# electron
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
    "electron >= 5"
  ]
}
```
- https://www.npmjs.com/package/electron-to-chromium

<p>&nbsp;<p>

## Polyfill
The `babel-polyfill` is included to ensure [Parcel](https://parceljs.org) bundles correctly without causing certain errors when building a production distribution, for example  this [issue](https://github.com/parcel-bundler/parcel/issues/871#issuecomment-367899522):

```
regeneratorRuntime is not defined 😩
```

<p>&nbsp;<p>


## Building for Electron
If you encounter `dist` build issues you may need to re-compile native modules.  
See [Using Native Node Modules](https://electronjs.org/docs/tutorial/using-native-node-modules) for background.

Run the `rebuild` script against your module.  For example, in your `package.json`:

```json
{
  "scripts": {
    "rebuild": "platform.electron rebuild"
  }
}
```
This will need to be done every time after `npm install` or `yarn install` has been run.


<p>&nbsp;<p>
<p>&nbsp;<p>

