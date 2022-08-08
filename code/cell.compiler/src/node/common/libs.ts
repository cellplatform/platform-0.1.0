import { sortBy, sortWith, ascend, descend, prop, uniq, uniqBy, pipe, groupBy, clone } from 'ramda';
export const R = { sortBy, sortWith, ascend, descend, prop, uniq, uniqBy, pipe, groupBy, clone };

export * as semver from 'semver';
export { appendFileSync } from 'fs-extra';

import * as jpath from 'jsonpath';
export { jpath };

/* eslint-disable */
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
export { ModuleFederationPlugin };
/* eslint-enable */

/**
 * @Platform
 */
import { id } from '@platform/util.value';
export { id, rx, defaultValue, value, time, deleteUndefined } from '@platform/util.value';
export const slug = id.shortid;

export { StateObject } from '@platform/state';

export { fs } from '@platform/fs';
export { log } from '@platform/log/lib/server';
export { Schema, Uri, Encoding, ManifestHash } from '@platform/cell.schema';

export { exec } from '@platform/exec';
export { Port } from '@platform/http/lib/node';
export { Path, Format } from '@platform/cell.runtime.node/lib/common';
export { ManifestFile } from '@platform/cell.fs.local';

/**
 * @system
 */
export { Builder } from 'sys.ui.dev/lib/api/Builder';
