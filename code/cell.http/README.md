![Module](https://img.shields.io/badge/%40platform-cell.http-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/cell.http.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/cell.http)
![banner](https://user-images.githubusercontent.com/185555/70659889-d8d20900-1cc5-11ea-9ba8-f8c3bdabe4ea.png)

HTTP cloud/server and client tools for CellOS.  
Sample: https://cell.platform.uiharness.com

<p>&nbsp;</p>

## Setup

    yarn add @platform/cell.http

<p>&nbsp;</p>

## Local Development

Example web servers in the form of an http [micro](../micro)-service
and [zeit/now](https://zeit.co) (lambdas) exist within the `/src.server/` folder.  
From the project root use scripts:

    yarn start   # Start the local HTTP server.
    yarn watch   # Start the local HTTP server in file-watcher mode.
    yarn now     # Start the local simulation of `zeit/now`.

To run against a live [mongo database](https://www.mongodb.com/cloud/atlas), which is necessary for testing the [zeit/now](https://zeit.co) implementation, add a `.env` within the project root:

```.env
PLATFORM_MONGO="<connection-string>"
```

<p>&nbsp;</p>

## Command Line

Insert a script in your `package.json` to easily access the command-line-interface:

```json
{
  "scripts": {
    "cell": "cell $@"
  }
}
```

Then run `yarn cell` to see available options, for instance:

```bash
yarn cell ls
yarn cell deploy
```

<p>&nbsp;</p>
<p>&nbsp;</p>
