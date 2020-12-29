import { fs, t } from '../../common';
import { Dirs } from './types';

export const Package = {
  /**
   * Walks up a directory path looking for the first [package.json] file.
   */
  async find(dir: string) {
    do {
      const path = fs.join(dir, 'package.json');
      if (await fs.pathExists(path)) return (await fs.readJson(path)) as t.INpmPackageJson;
      dir = dir.substring(0, dir.lastIndexOf('/'));
      if (dir.endsWith('/node_modules')) break;
    } while (dir.length > 0);
    return undefined;
  },
};

