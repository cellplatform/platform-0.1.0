import * as t from './types';
const pkg = require('../../../package.json') as t.NpmPackageJson; // eslint-disable-line

export { t, pkg };
export * from './libs';
export * from './util';
export * from './constants';

import { WebRuntime } from './libs';
export const bundle = WebRuntime.bundle;
