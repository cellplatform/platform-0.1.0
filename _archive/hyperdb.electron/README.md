![Module](https://img.shields.io/badge/%40platform-hyperdb.electron-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/hyperdb.electron.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/hyperdb.electron)
![banner](https://user-images.githubusercontent.com/185555/56085485-33496a00-5e98-11e9-8ec8-992d5687a955.png)

Safe [IPC](https://electronjs.org/docs/api/ipc-renderer) wrapper for working with [@platform/hyperdb](../hyperdb) in [electron](https://electronjs.org).


## Setup

    yarn add @platform/hyperdb.electron

See the [`/test`](./test) folder for example configuration and usage samples in a [uiharness](https://uiharness.com).

    yarn ui start

<p>&nbsp;<p><p>&nbsp;<p>

![diagram](https://user-images.githubusercontent.com/185555/56322016-03fa6c00-61bc-11e9-8aa3-2a365e4fd3cb.png)


<p>&nbsp;<p>

## Building for Electron
Run the `rebuild` script that fixes `dist` build issues with `sodium-native`.  See [issue #5851](https://github.com/electron/electron/issues/5851).

In your `package.json`:

```json
{
  "scripts": {
    "rebuild": "platform.electron rebuild"
  }
}
```
You may require `libtool` to complete as well as the XCode command-line tools that contains `gcc`:

```
brew install libtool
```





<p>&nbsp;<p><p>&nbsp;<p>

## See Also

- @platform/[hyperdb.electron](../hyperdb)
- @platform/[hyperdb.types](../hyperdb.types)
- @platform/[hyperdb.tools](../hyperdb.tools)
- @platform/[hyperdb.electron](../hyperdb.electron)
