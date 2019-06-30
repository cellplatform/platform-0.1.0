![Module](https://img.shields.io/badge/%40platform-ui.mapbox-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/ui.mapbox.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/ui.mapbox)
![banner](https://uiharness.sfo2.digitaloceanspaces.com/%40platform/repo-banners/ui.mapbox.png)

[Mapbox](https://www.mapbox.com/) UI components.

<p>&nbsp;<p>

## Setup

    yarn add @platform/ui.mapbox

If you experience issues with parceljs bundling, try adding the contents of [`.babelrc`](./.babelrc). 
See [issue](https://github.com/parcel-bundler/parcel/issues/1128#issuecomment-497251288).

<p>&nbsp;<p>

## Token
Include a file at `/test/TOKEN.ts` containing your mapbox access-token:

```typescript
/**
 * manage:  https://account.mapbox.com/access-tokens
 */
export const TOKEN = '...';

```
NB: This is excluded from the repo for obvious reasons.  
Get your own token at https://account.mapbox.com/access-tokens


<p>&nbsp;<p>

## Refs

- [mapbox-gl-js](https://docs.mapbox.com/mapbox-gl-js/overview/) documentation


<p>&nbsp;<p>
<p>&nbsp;<p>
