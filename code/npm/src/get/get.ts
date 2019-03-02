import { log, exec, INpmInfo } from '../common';
export type NpmInfoField = 'name' | 'version' | 'dist-tags' | 'dist' | 'license';

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
    throw error;
  }
}

/**
 * Lookup the latest version of a module on NPM.
 */
export async function getVersion(moduleName: string) {
  const json = await getJson(moduleName, ['dist-tags']);
  if (!json) {
    throw new Error(`Cannot get version for '${moduleName}' as it could not be found on NPM.`);
  }
  return json.latest;
}

/**
 * Looks up the latest version for each key/value pair
 * eg { dependences } on a package.json file.
 */
export async function getVersions(modules: ({ [moduleName: string]: string }) | string[]) {
  const deps = Array.isArray(modules)
    ? modules.reduce((acc, key) => ({ ...acc, [key]: 'latest' }), {})
    : { ...modules };
  const wait = Object.keys(deps).map(async moduleName => {
    const current = deps[moduleName].trim();
    let version = await getVersion(moduleName);
    version = current.startsWith('^') ? `^${version}` : version;
    deps[moduleName] = version;
  });
  await Promise.all(wait);
  return deps as { [moduleName: string]: string };
}

/**
 * INTERNAL
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
