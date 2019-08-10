import * as t from './types';

const PKG = require('../../../package.json') as { name: string; version: string };

export { t, PKG };
export * from './libs';
