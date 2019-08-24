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


## Workflow

- Develop UI components on local dev-server within the [UIHarness](https://uiharness.com) or anything that can produce a javascript bundle (eg [ParcelJS](https://parceljs.org)):

- Ensure the UI module has a `bundle` script within it's `package.json`.

- Create an `ssr.yml` configuration file for the server.

## Sample

The `/sample/now` and `/sample/server` are expecting a `.env` file with your S3 account information:

```
# 
# Digital Ocean "SPACES" or AWS "S3" connection secrets.
# 
SPACES_KEY="..."
SPACES_SECRET="..."

```


#### Examples:

```bash
cd sample/ui
yarn start
```


Bundle and push to S3

```bash
cd sample/now
yarn ssr bundle
```

Start local SSR server for testing bundle:

```bash
cd sample/now
yarn start
```

Release bundled version by updating manifest:

```bash
cd sample/now
yarn ssr release
```


<p>&nbsp;<p>

## Routes
The following system routes are exposed for examining meta-data about the current state and configuration of the server.

```
https://domain.com/.manifest
https://domain.com/.manifest/summary
https://domain.com/.manifest/summary/<site>
```


<p>&nbsp;<p>
<p>&nbsp;<p>


