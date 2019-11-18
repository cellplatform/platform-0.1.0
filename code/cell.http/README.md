![Module](https://img.shields.io/badge/%40platform-cell.http-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/cell.http.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/cell.http)
![banner](https://user-images.githubusercontent.com/185555/69022072-e4137b00-0a1e-11ea-81e9-0c82e03f447f.png)

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
<p>&nbsp;</p>
