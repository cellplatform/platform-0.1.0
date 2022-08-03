import { exec, log, semver, t } from '../common';

export type INpmVersionOptions = {
  prerelease?: t.NpmPrerelease;
};
export type INpmInfoOptions = {
  cwd?: string;
  NPM_TOKEN?: string;
};

/**
 * Lookup the latest version of a module on NPM.
 *
 *    By default the latest version does not include pre-release versions.
 *    Pass `{ prerelease: true|'alpha'|'beta' }` to retrieve the latest pre-release.
 *
 */
export async function getVersion(
  moduleName: string,
  options: INpmVersionOptions & INpmInfoOptions = {},
) {
  const versions = await getJson(moduleName, 'versions', options);
  if (!versions || versions.length === 0) {
    return '';
  }
  const latest = (index: number): string => {
    const version = versions[index];
    return filter.version(version, options) ? version : latest(index - 1);
  };
  return latest(versions.length - 1);
}

/**
 * Retrieves the complete version history for the given module (newest-to-oldest).
 *
 *    By default the latest version does not include pre-release versions.
 *    Pass `{ prerelease: true|'alpha'|'beta' }` to retrieve the latest pre-release.
 *
 */
export async function getVersionHistory(
  moduleName: string,
  options: INpmVersionOptions & INpmInfoOptions = {},
) {
  const versions: string[] = (await getJson(moduleName, 'versions', options)) || [];
  return versions.filter((version) => filter.version(version, options)).reverse();
}

/**
 * Looks up the latest version for each key/value pair
 * eg `{ dependences }` on a package.json file.
 */
export async function getVersions(
  modules: { [moduleName: string]: string } | string[],
  options: INpmVersionOptions & INpmInfoOptions = {},
) {
  const deps = Array.isArray(modules)
    ? modules.reduce((acc, key) => ({ ...acc, [key]: 'latest' }), {})
    : { ...modules };
  const wait = Object.keys(deps).map(async (moduleName) => {
    const current = deps[moduleName].trim();
    let version = await getVersion(moduleName, options);
    version = current.startsWith('^') ? `^${version}` : version;
    deps[moduleName] = version;
  });
  await Promise.all(wait);
  return deps as { [moduleName: string]: string };
}

/**
 * [Helpers]
 */
async function getJson(
  moduleName: string,
  field: string,
  options: INpmInfoOptions = {},
): Promise<any> {
  const { NPM_TOKEN, cwd } = options;

  /**
   * NOTE: `yarn` used instead of `npm` as yarn respects the existence
   *       of `.npmrc` when running within [child_process].
   */
  const cmd = `yarn info ${moduleName} ${field} --json`;

  const parseJson = (text: string) => {
    try {
      const json = JSON.parse(text);
      return json ? json.data : undefined;
    } catch (error: any) {
      log.error('Raw JSON text:');
      log.info.yellow(text);
      // console.log('error', error);
      throw error;
    }
  };

  try {
    const env = NPM_TOKEN ? { NPM_TOKEN } : undefined;
    const result = await exec.command(cmd).run({ cwd, env, silent: true });
    const text = result.info.join();
    return result.info.length > 0 ? parseJson(text) : undefined;
  } catch (error: any) {
    if (error.message.includes('Not found')) {
      return undefined; // Return nothing indicating the module was not found on NPM.
    } else {
      throw new Error(
        `Failed while reading info for '${moduleName}' from NPM.\nCMD: ${log.yellow(cmd)}\n\n${
          error.message
        }`,
      );
    }
  }
}

const filter = {
  /**
   * Filters a version include or excluding pre-release values.
   */
  version(version: string, options: INpmVersionOptions) {
    const { prerelease } = options;
    const pre = semver.prerelease(version);
    if (pre) {
      if (prerelease === true) {
        return true;
      }
      if (typeof prerelease === 'string' && pre.includes(prerelease)) {
        return true;
      }
      return false;
    }
    return true;
  },
};
