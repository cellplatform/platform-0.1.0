![Module](https://img.shields.io/badge/%40platform-cell.compiler-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/cell.compiler.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/cell.compiler)
![banner](https://user-images.githubusercontent.com/185555/95702738-a6a88380-0ca9-11eb-948c-c17317e4d7cd.png)

Code compilation and bundling.

<p>&nbsp;</p>

## Setup

    yarn add @platform/cell.compiler

<p>&nbsp;</p>

## Command Line

To use the compiler from commands within `package.json` include the following scripts:

```json
"scripts": {
  "build": "tsc $@",
  "dev": "cell.compiler dev $@",
  "bundle": "cell.compiler bundle $@",
  "watch": "cell.compiler watch $@",
  "info": "cell.compiler info $@",
  "clean": "cell.compiler clean $@",
  "serve": "cell.compiler serve $@",
},
```

<p>&nbsp;</p>
<p>&nbsp;</p>
