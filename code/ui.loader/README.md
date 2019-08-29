![Module](https://img.shields.io/badge/%40platform-ui.loader-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/ui.loader.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/ui.loader)
![banner](https://platform.sfo2.digitaloceanspaces.com/repo-banners/ui.loader.png)

Bootstrapper for progressively loading UI modules dynamically.

<p>&nbsp;<p>


<div style="text-align:center"><img src="https://user-images.githubusercontent.com/185555/63910765-29f22000-ca7c-11e9-9d41-ac0ef2741cf1.gif" /></div>


<p>&nbsp;<p>


## Setup

    yarn add @platform/ui.loader


<p>&nbsp;<p>

## Sample

#### Sample UI
To run the sample within [UIHarness](https://uiharness.com): 

```bash
yarn start
```

The UI entry point to start exploring from is at `/src/sample/entry.tsx` (see `uiharness.yml`).

<p>&nbsp;<p>


#### Sample Server

To bundle and test using [@platform/react.ssr](../react.ssr) ensure you have a `.env` file in the root of the project with S3 connection details configured within `sample.server/ssr.yml`


```
# .env
SPACES_KEY="..."
SPACES_SECRET="..."
```

ensure node modules are installed within the sample server folder:

```bash
cd sample.server
yarn
```

Bundle, deploy and release:

```bash
yarn ssr bundle
# ... follow prompts ...

yarn ssr release
# ... follow prompts ...
```

Run the production server locally:

```bash
yarn watch
```

For more details on how to operate the SSR server see [@platform/react.ssr](../react.ssr)

<p>&nbsp;<p>
<p>&nbsp;<p>
