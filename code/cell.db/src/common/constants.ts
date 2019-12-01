import { INpmPackageJson } from './types';

export const PKG = require('../../package.json') as INpmPackageJson;

const DEPS = PKG.dependencies || {};
export const SCHEMA_VERSION = DEPS['@platform/cell.schema'] || '';
