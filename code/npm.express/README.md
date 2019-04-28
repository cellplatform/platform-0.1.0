![Module](https://img.shields.io/badge/%40platform-npm.express-%23EA4E7E.svg)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM](https://img.shields.io/npm/v/@platform/npm.express.svg?colorB=blue&style=flat)](https://www.npmjs.com/package/@platform/npm.express)
![banner](https://user-images.githubusercontent.com/185555/56625096-bd12e780-668f-11e9-935e-58bea6081f51.png)

[Express](https://expressjs.com) [middleware](https://expressjs.com/en/guide/using-middleware.html) for working with [NPM](http://npmjs.com).

- Continuous deployment via [NPM](http://npmjs.com).
- Run as [middleware](https://expressjs.com/en/guide/using-middleware.html) or use [Docker container](https://www.docker.com) directly (recommended).

<p>&nbsp;<p>

<p>&nbsp;<p>

## Example

Run the example directly in node:

    yarn example

or run the example within docker:

    yarn dbuild
    cd examples
    docker-compose up

see the `/examples/docker-compose.yml` file for example configuration and command-line arguments to pass to the container.

<p>&nbsp;<p>

## Middleware

To use the [express middleware](https://expressjs.com/en/guide/using-middleware.html) directly

```typescript
import * as express from 'express';
import { router } from '@platform/npm.express';

const getContext = async () => {
  return {
    name: 'my-module',                // Name of the NPM module being managed.
    downloadDir: '/download/folder',  // Directory where latest NPM version is downloaded to.
  };
};

const routes = router.create({ getContext });
const server = express().use(routes);
server.listen(1234);
```

## Routes

    GET   /status
    POST  /update
    POST  /start
    POST  /stop

Query-string parameters for `/status`:
```typescript
{
  versions?=<number>    // Include version history. If number (n) provided returns only the latest (n) versions.
  size?=<boolean>       // Include size of the download folder.
}
```


Body parameters for `/update`:
```typescript
{ 
  restart?: boolean;                        // Restart the service once updated (default: true)
  version?: string | 'latest';              // Specific version to install (default: 'latest')
  prerelease?: boolean | 'alpha' | 'beta',  // Install pre-release version, eg 1.2.0-beta.0 (default: false)
  reset?: boolean,                          // Delete existing download before installing (default: false)
  dryRun?: boolean,                         // Perform all checks, but don't actually change anything.
}
```

Body parameters for `/start`:
```typescript
{ restart?: boolean }
```


## Command-Line Arguments

To configure the module when working with it as [Docker container](https://www.docker.com) pass the following command-line arguments:

```bash
    --npm-module='<string>'             # (required) The name of the NPM module being managed.
    --dir='<string>'                    # (required) Path to the download directory.
    --port='<number>'                   # (optional) Port to run the management server on.
    --prerelease='<boolean|alpha|beta>' # (optional) Whether pre-release versions should be used (default:false).
    --url-prefix='<string>'             # (optional) Prefix to prepend URL's with, eg /foo => GET /foo/status
    --update                            # (optional) Flag indicating if update performed at startup (default:false).
```

see the `/examples/docker-compose.yml` file for example configuration.


### .env
These same arguments can alternatively be specified as environment variables, see `/example/env/main.env` and the `env_file` reference in `docker-compose.yml` for example.

```bash
NPM_MODULE=           --npm-module
NPM_DIR=              --dir
NPM_PORT=             --port
NPM_PRERELEASE=       --prerelease
NPM_URL_PREFIX=       --url-prefix
NPM_UPDATE=           --update
```

Any values passed explicitly to the command will override the environment variables.


