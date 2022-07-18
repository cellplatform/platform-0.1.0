import * as constants from './constants';
import * as t from './types';

const pkg = require('../../package.json') as t.NpmPackageJson; // eslint-disable-line

export { t, constants, pkg };
export * from './constants';
export * from './libs';
export * from './Translate';
export * from './Is';
export * from './rx';

export { LANGUAGES, DEFAULT, COLORS } from './constants';
