import * as t from '../node/common/types';

export * from '../node/common';
export const pkg = require('../../package.json') as t.INpmPackageJson; // eslint-disable-line
