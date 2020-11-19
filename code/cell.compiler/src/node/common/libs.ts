import { sortBy, sortWith, ascend, descend, prop, uniq, uniqBy, pipe, groupBy } from 'ramda';
export const R = { sortBy, sortWith, ascend, descend, prop, uniq, uniqBy, pipe, groupBy };

export { rx, id, defaultValue, value, time } from '@platform/util.value';

export { Builder } from '@platform/cell.module';
export { StateObject } from '@platform/state';

import * as jpath from 'jsonpath';
export { jpath };

export { fs } from '@platform/fs';

export { log } from '@platform/log/lib/server';

export { Client, HttpClient } from '@platform/cell.client';

export { Schema, Uri, Encoding } from '@platform/cell.schema';

import minimist from 'minimist';
export { minimist };

/* eslint-disable */
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
export { ModuleFederationPlugin };
/* eslint-enable */

export { exec } from '@platform/exec';
export { port } from '@platform/http/lib/node';
export { path, format } from '@platform/cell.runtime/lib/runtime.node/common';
