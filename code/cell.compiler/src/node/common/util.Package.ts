import { fs } from './libs';
import * as t from './types';

export const Package = {
  /**
   * Walks up a directory path looking for the first [package.json] file.
   */
  async findClosestPath(dir: string) {
    do {
      const path = fs.join(dir, 'package.json');
      if (await fs.pathExists(path)) {
        return { path, dir };
      } else {
        dir = dir.substring(0, dir.lastIndexOf('/'));
        if (dir.endsWith('/node_modules')) break;
      }
    } while (dir.length > 0);
    return '';
  },

  /**
   * Walks up a directory path looking for the first [package.json] file.
   */
  async findClosest(dir: string) {
    const pkg = await Package.findClosestPath(dir);
    return pkg ? { ...pkg, json: (await fs.readJson(pkg.path)) as t.INpmPackageJson } : undefined;
  },
};
