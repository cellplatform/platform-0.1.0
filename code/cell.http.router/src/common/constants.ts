import { fs } from './libs';

export { ERROR } from '@platform/cell.schema';

export const IS_CLOUD = Boolean(process.env.NOW_REGION);
const TMP = IS_CLOUD ? '/tmp' : fs.resolve('tmp');
export const PATH = {
  MODULE: fs.join(__dirname, '../../..'),
  TMP,
  CACHE_DIR: fs.join(TMP, '.cache'),
};

/**
 * Versions (from PACKAGE.json)
 */
import { PKG } from './constants.pkg';
export { PKG };
const DEPS = PKG.dependencies;

const toVersion = (input: string) => (input || '').split('@')[2];
export function getSystem() {
  const versions = getVersions();
  const router = toVersion(versions.router);
  const schema = toVersion(versions.schema);
  const version = `router@${router}; schema@${schema}`;
  return {
    version,
    versions,
  };
}

/**
 * Read module versions.
 */
export function getVersions() {
  const depVersion = (key: string, version?: string) => {
    version = version || DEPS[key] || '-';
    version = (version || '').replace(/^\^/, '').replace(/^\~/, '');
    return `${key}@${version}`;
  };

  const version = {
    schema: depVersion('@platform/cell.schema'),
    types: depVersion('@platform/cell.types'),
    router: depVersion('@platform/cell.http.router', PKG.version),
    toVersion,
  };

  return version;
}
