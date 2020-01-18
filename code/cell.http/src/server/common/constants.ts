import * as t from './types';

export { ERROR } from '@platform/cell.schema';

/**
 * Versions (from PACKAGE.json)
 */
export const PKG = require('../../../package.json') as t.INpmPackageJson;
const DEPS = PKG.dependencies || {};

export function getVersions() {
  const toDepVersion = (key: string, version?: string) => {
    version = version || DEPS[key] || '-';
    return `${key}@${version}`;
  };

  const version: t.IResGetSysInfo['version'] & { toVersion: (input: string) => string } = {
    hash: 'sha256',
    schema: toDepVersion('@platform/cell.schema'),
    types: toDepVersion('@platform/cell.types'),
    server: toDepVersion('@platform/cell.http', PKG.version),
    toVersion(input: string) {
      return (input || '').split('@')[2];
    },
  };

  return version;
}
