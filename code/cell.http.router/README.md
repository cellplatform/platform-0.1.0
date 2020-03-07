![Module](https://img.shields.io/badge/%40platform-cell.http.router-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/cell.http.router.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/cell.http.router)
![banner](https://user-images.githubusercontent.com/185555/76151555-23bfb900-611b-11ea-9497-2773c93f61e3.png)

Isolated router logic for the CellOS [HTTP server](../cell.http).

---

**NOTE:** Keeping the route logic cleanly isolated from the HTTP server allows the routes to be
used in contexts where the [node](https://nodejs.org/) HTTP server libraries are not available, for example in
a web-browser or [ReactNative](https://reactnative.dev/) etc.

When an HTTP server is not available, requests to the routes are commonly passed in via an Observable
simulating incoming HTTP requests.

<p>&nbsp;</p>

## Setup

    yarn add @platform/cell.http.router

<p>&nbsp;</p>
<p>&nbsp;</p>
