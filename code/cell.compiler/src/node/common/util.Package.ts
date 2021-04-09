import { fs, semver } from './libs';
import * as t from './types';

const NODE_MODULES = 'node_modules/';
export const BUMP_LEVELS: t.VersionBumpLevel[] = ['major', 'minor', 'patch', 'alpha', 'beta'];

export const Package = {
  /**
   * Returns the portion of the path after "node_modules/".
   */
  pathAfterNodeModules(path: string) {
    const index = path.lastIndexOf(NODE_MODULES);
    return index > -1 ? path.substring(index + NODE_MODULES.length) : '';
  },

  /**
   * Walks up a directory path looking for the first [package.json] file.
   */
  async findClosestPath(dir: string) {
    do {
      const path = dir.endsWith('/package.json') ? dir : fs.join(dir, 'package.json');
      if (await fs.pathExists(path)) {
        const name = Package.pathAfterNodeModules(dir);
        return { path, dir, name };
      } else {
        dir = dir.substring(0, dir.lastIndexOf('/'));
        if (dir.endsWith(NODE_MODULES)) break; // We hit the containing "node_modules"- so not found.
      }
    } while (dir.length > 0);
    return undefined; // NB: Given path is not within a [node_modules] folder.
  },

  /**
   * Walks up a directory path looking for the first [package.json] file.
   */
  async findClosest(dir: string) {
    const pkg = await Package.findClosestPath(dir);
    if (!pkg) return undefined;
    const json = (await fs.readJson(pkg.path)) as t.INpmPackageJson;
    const res = { ...pkg, json };
    return res;
  },

  /**
   * Bump the [package.json].
   */
  async bump(path: string, level: t.VersionBumpLevel) {
    if (!BUMP_LEVELS.includes(level)) {
      const supported = BUMP_LEVELS.join(',');
      const err = `Version bump level [${level}] not supported. Supported levels: ${supported}.`;
      throw new Error(err);
    }

    if (!(await fs.pathExists(path))) {
      const err = `Cannot [${level}] bump package.json. File does not exist: ${path}`;
      throw new Error(err);
    }

    const json = (await fs.readJson(path)) as t.INpmPackageJson;
    const from = json.version || '0.0.0';

    const isPrerelease = ['alpha', 'beta'].includes(level);
    const increment = (isPrerelease ? 'prerelease' : level) as semver.ReleaseType;
    const prereleasePrefix = isPrerelease ? level : undefined;

    const to = semver.inc(json.version || '0.0.0', increment, prereleasePrefix) || undefined;
    if (!to) {
      const err = `Failed to bump package.json to [${level}]. An incremented version from '${from}' returned undefined.`;
      throw new Error(err);
    }

    json.version = to;
    await fs.writeFile(path, `${JSON.stringify(json, null, '  ')}\n`);

    return {
      version: { from, to },
      json,
    };
  },
};
