import { INpmPackageJson } from './types';
export const PKG = require('../../../package.json') as INpmPackageJson;

export const ERROR = {
  MALFORMED_URI: 'HTTP/uri/malformed',
};
