import { fs } from './libs';
import * as t from './types';

const NODE_MODULES = 'node_modules/';

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
};
