import { sortBy, prop, uniq, pipe } from 'ramda';
export const R = { sortBy, prop, uniq, pipe };

import { rx, id, defaultValue, value, time } from '@platform/util.value';
export { rx, id, defaultValue, value, time };

export { Builder } from '@platform/cell.module';
export { StateObject } from '@platform/state';

import * as jpath from 'jsonpath';
export { jpath };

export { fs } from '@platform/fs';

export { log } from '@platform/log/lib/server';

export { Client, HttpClient } from '@platform/cell.client';

export { Schema, Uri } from '@platform/cell.schema';

import minimist from 'minimist';
export { minimist };

/* eslint-disable */
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
export { ModuleFederationPlugin };
/* eslint-enable */

export { exec } from '@platform/exec';
