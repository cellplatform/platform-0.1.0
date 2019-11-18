![Module](https://img.shields.io/badge/%40platform-fsdb.mongo-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/fsdb.mongo.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/fsdb.mongo)
![banner](https://platform.sfo2.digitaloceanspaces.com/repo-banners/fsdb.mongo.png)

Standard `IDb` abstraction over [mongodb](https://github.com/mongodb/node-mongodb-native).

<p>&nbsp;<p>

## Setup

    yarn add @platform/fsdb.mongo

<p>&nbsp;<p>

## Test

To run integration tests against a live [mongo database](https://www.mongodb.com/cloud/atlas) add a `.env` file to the root with:

```.env
MONGO_TEST="<connection-string>"
```

The run the integration tests:

    yarn run test:integration

<p>&nbsp;<p>
<p>&nbsp;<p>
