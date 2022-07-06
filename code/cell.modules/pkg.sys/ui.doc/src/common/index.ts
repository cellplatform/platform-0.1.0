import * as t from './types';
const pkg = require('../../package.json') as t.NpmPackageJson; // eslint-disable-line

export { t, pkg };
export * from './libs';
export * from './colors';
export * from './fonts';
