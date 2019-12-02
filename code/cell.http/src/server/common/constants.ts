import { INpmPackageJson } from './types';
export const PKG = require('../../../package.json') as INpmPackageJson;

export const ERROR = {
  SERVER: 'HTTP/server',
  CONFIG: 'HTTP/config',
  NOT_FOUND: 'HTTP/notFound',
  MALFORMED_URI: 'HTTP/uri/malformed',
};
