![Module](https://img.shields.io/badge/%40platform-react.ssr-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/react.ssr.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/react.ssr)
![banner](https://platform.sfo2.digitaloceanspaces.com/repo-banners/react.ssr.png)

An SSR (server-side-renderer) server for react apps bundled with ParcelJS and hosted on S3.

## Setup

    yarn add @platform/react.ssr


<p>&nbsp;<p>

![diagram](https://user-images.githubusercontent.com/185555/63076383-2beeb600-bf89-11e9-843f-b221e95d1840.png)


## Workflow

1. Develop you app using [UIHarness](https://uiharness.com) (local example: `yarn dev`)
2. Bundle the app (local example: `yarn bundle`)
   Ensue you have a `bundle/config/output` key specified in `uiharness.yml`
3. Create a `manifest.yml`   
3. Run app within SSR server (local example: `yarn start` or `yarn watch`)

<p>&nbsp;<p>
<p>&nbsp;<p>


