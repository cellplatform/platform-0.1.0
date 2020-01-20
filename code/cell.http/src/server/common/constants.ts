import * as t from './types';

export { ERROR } from '@platform/cell.schema';

/**
 * Versions (from PACKAGE.json)
 */
export const PKG = require('../../../package.json') as t.INpmPackageJson;
const DEPS = PKG.dependencies || {};

const toVersion = (input: string) => (input || '').split('@')[2];
export function getSystem() {
  const versions = getVersions();
  const server = toVersion(versions.server);
  const schema = toVersion(versions.schema);
  const system = `CellOS; http@${server}; schema@${schema}`;
  return {
    system,
    ...versions,
  };
}

export function getVersions() {
  const depVersion = (key: string, version?: string) => {
    version = version || DEPS[key] || '-';
    return `${key}@${version}`;
  };
  const version = {
    schema: depVersion('@platform/cell.schema'),
    types: depVersion('@platform/cell.types'),
    server: depVersion('@platform/cell.http', PKG.version),
    toVersion,
  };

  return version;
}
