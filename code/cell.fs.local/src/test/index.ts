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

export const writeFile = async (path: string, data: Buffer) => {
  await fs.ensureDir(fs.dirname(path));
  await fs.writeFile(path, data);
};

export const init = () => FilesystemLocal({ dir: PATH.LOCAL, fs });

export const util = {
  initLocal: init,
  PATH,
  fs: fs as t.INodeFs,
  pathExists: fs.pathExists,
  writeFile,
  env: fs.env.value,
  async image(path: string) {
    return fs.readFile(fs.join(fs.resolve(`src/test/images`), path));
  },
  async reset() {
    await fs.remove(TMP);
  },
};
