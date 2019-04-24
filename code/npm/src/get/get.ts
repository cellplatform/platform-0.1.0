import { exec, INpmInfo, log, semver, t } from '../common';

export type NpmInfoField = 'name' | 'version' | 'versions' | 'dist-tags' | 'dist' | 'license';
export type INpmVersionOptions = {
  prerelease?: t.NpmPrerelease;
};

/**
 * Lookup latest info for module from NPM.
 */
export async function getInfo(moduleName: string): Promise<INpmInfo | undefined> {
  try {
    const fields: NpmInfoField[] = ['name', 'version', 'dist-tags', 'dist', 'license'];
    const json = await getJson(moduleName, fields);
    const name = json.name;
    const latest = json['dist-tags'].latest;
    const size = json.dist.unpackedSize;
    return {
      name,
      latest,
      size,
      json,
    };
  } catch (error) {
    const message = `Failed getting info for '${moduleName}'. ${error.message}`;
    throw new Error(message);
  }
}

/**
 * Lookup the latest version of a module on NPM.
 *
 *    By default the latest version does not include pre-release versions.
 *    Pass `{ prerelease: true|'alpha'|'beta' }` to retrieve the latest pre-release.
 *
 */
export async function getVersion(moduleName: string, options: INpmVersionOptions = {}) {
  const { prerelease = false } = options;
  const versions = await getJson(moduleName, ['versions']);
  if (!versions || versions.length === 0) {
    throw new Error(`Cannot get version for '${moduleName}' as it could not be found on NPM.`);
  }
  const latest = (index: number): string => {
    const version = versions[index];
    const pre = semver.prerelease(version);
    if (pre) {
      if (prerelease === true) {
        return version;
      }
      if (typeof prerelease === 'string' && pre.includes(prerelease)) {
        return version;
      }
      return latest(index - 1); // <== RECURSION
    }
    return version;
  };
  return latest(versions.length - 1);
}

/**
 * Looks up the latest version for each key/value pair
 * eg `{ dependences }` on a package.json file.
 */
export async function getVersions(
  modules: ({ [moduleName: string]: string }) | string[],
  options: INpmVersionOptions = {},
) {
  const deps = Array.isArray(modules)
    ? modules.reduce((acc, key) => ({ ...acc, [key]: 'latest' }), {})
    : { ...modules };
  const wait = Object.keys(deps).map(async moduleName => {
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
async function getJson(moduleName: string, fields: NpmInfoField[]): Promise<any> {
  const options = fields.join(' ');
  const cmd = `npm info ${moduleName} --json ${options}`.trim();
  const parseJson = (text: string) => {
    try {
      const json = JSON.parse(text);
      return json;
    } catch (error) {
      log.error('Raw JSON text:');
      log.info(text);
      throw error;
    }
  };

  try {
    const result = await exec.cmd.run(cmd, { silent: true });
    const text = result.info.join('\n');
    return result.info.length > 0 ? parseJson(text) : undefined;
  } catch (error) {
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
