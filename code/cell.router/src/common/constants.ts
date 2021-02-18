import { fs } from './libs';
const env = fs.env.value;

export { ERROR } from '@platform/cell.schema';

/**
 * NOTE:
 *    When deploying to vercel (cloud) ensire "expose environment variables"
 *    is enabled in the project settings.
 *
 *    https://vercel.com/docs/platform/environment-variables#system-environment-variables
 *
 */
export const VERCEL = {
  ENV: env('VERCEL_ENV'),
  REGION: env('VERCEL_REGION'),
  URL: env('VERCEL_URL'),
};

console.log('VERCEL', VERCEL); // TEMP 🐷

export const IS_CLOUD = Boolean(VERCEL.REGION);
const TMP = IS_CLOUD ? '/tmp' : fs.resolve('tmp');

export const PATH = {
  TMP,
  CACHE_DIR: fs.join(TMP, '.cache'),
  MODULE: fs.join(__dirname, '../../..'),
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
    router: depVersion('@platform/cell.router', PKG.version),
    toVersion,
  };

  return version;
}
