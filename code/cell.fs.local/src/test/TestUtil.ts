import { fs } from '@platform/fs';

import { FsDriverLocal } from '..';
import { t } from '../common';

const TMP = fs.resolve('tmp');

export const PATH = {
  TMP,
  LOCAL: fs.join(TMP, 'local'),
};

export const TestUtil = {
  createLocal: () => FsDriverLocal({ dir: PATH.LOCAL, fs }),
  PATH,
  node: fs as t.INodeFs,
  env: fs.env.value,
  pathExists: fs.pathExists,

  async writeFile(path: string, data: Buffer | Uint8Array) {
    await fs.ensureDir(fs.dirname(path));
    await fs.writeFile(path, data);
  },

  async readImage(path: string) {
    return fs.readFile(fs.join(fs.resolve(`static.test/images`), path));
  },

  async copyImage(source: string, target: string) {
    const data = await TestUtil.readImage(source);
    target = fs.join(PATH.LOCAL, target);
    await TestUtil.writeFile(target, data);
    return target;
  },

  async reset() {
    await fs.remove(TMP);
  },
};
