import { INpmPackageJson } from './types';
export const PKG = require('../../../package.json') as INpmPackageJson;

export const ERROR = {
  MALFORMED_URI: 'HTTP/uri/malformed',

  // TODO 🐷 - route all error types off this constant
};
