import { fs } from '@platform/fs';

import { FilesystemLocal } from '..';
import { Schema, t } from '../common';

export { expect, expectError } from '@platform/test';
export { log } from '@platform/log/lib/server';
export * from '../common';

Schema.Uri.ALLOW.NS = ['foo*'];

const TMP = fs.resolve('tmp');
export const PATH = {
  TMP,
  LOCAL: fs.join(TMP, 'local'),
};

export const util = {
  createLocal: () => FilesystemLocal({ dir: PATH.LOCAL, fs }),
  PATH,
  node: fs as t.INodeFs,
  env: fs.env.value,
  pathExists: fs.pathExists,

  async writeFile(path: string, data: Buffer) {
    await fs.ensureDir(fs.dirname(path));
    await fs.writeFile(path, data);
  },

  async readImage(path: string) {
    return fs.readFile(fs.join(fs.resolve(`static.test/images`), path));
  },

  async copyImage(source: string, target: string) {
    const data = await util.readImage(source);
    target = fs.join(PATH.LOCAL, target);
    await util.writeFile(target, data);
    return target;
  },

  async reset() {
    await fs.remove(TMP);
  },
};
