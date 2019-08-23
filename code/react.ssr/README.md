![Module](https://img.shields.io/badge/%40platform-react.ssr-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/react.ssr.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/react.ssr)
![banner](https://user-images.githubusercontent.com/185555/63076436-66585300-bf89-11e9-8bca-0b80ae5313d0.png)

A lightweight SSR (server-side-rendering) system for react apps bundled with ParcelJS and hosted on S3.

#### Highlights:

- Store assets on [S3](https://aws.amazon.com/s3/) (or Digital Ocean [Spaces](https://www.digitalocean.com/products/spaces/)).
- Serve entry HTML from server (immediate load from "server-side-render").
- `307` redirect all other assets to S3/CDN.
- Manage lifecycle with simple command-line tools:
    - Bundle and push to S3 via command-line.
    - Manage version release (and roll-backs) across multiple sites/environments.

<p>&nbsp;<p>



![diagram](https://user-images.githubusercontent.com/185555/63561626-c6b14b00-c5ae-11e9-9102-796597f4e28c.png)


## Setup

    yarn add @platform/react.ssr


<p>&nbsp;<p>


## Sample

Develop UI components on local dev-server within the [UIHarness](https://uiharness.com):

```bash
cd sample/ui
yarn start
```


Bundle and push to S3

```
cd sample/now
yarn ssr bundle
```

Start local SSR server for testing bundle:

```
cd sample/now
yarn start
```

Release bundled version by updating manifest:

```
cd sample/now
yarn ssr release
```



<p>&nbsp;<p>
<p>&nbsp;<p>


