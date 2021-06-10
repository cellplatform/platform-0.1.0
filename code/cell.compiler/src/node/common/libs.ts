import { sortBy, sortWith, ascend, descend, prop, uniq, uniqBy, pipe, groupBy, clone } from 'ramda';
export const R = { sortBy, sortWith, ascend, descend, prop, uniq, uniqBy, pipe, groupBy, clone };

import { id } from '@platform/util.value';
export { id, rx, defaultValue, value, time, deleteUndefined } from '@platform/util.value';
export const slug = id.shortid;

export { Builder } from '@platform/cell.module';
export { StateObject } from '@platform/state';

import * as jpath from 'jsonpath';
export { jpath };

export { fs } from '@platform/fs';

export { log } from '@platform/log/lib/server';

export { Client, HttpClient } from '@platform/cell.client';

export { Schema, Uri, Encoding } from '@platform/cell.schema';

/* eslint-disable */
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
export { ModuleFederationPlugin };
/* eslint-enable */

export { exec } from '@platform/exec';
export { port } from '@platform/http/lib/node';
export { Path, format } from '@platform/cell.runtime.node/lib/common';

import semver from 'semver';
export { semver };
