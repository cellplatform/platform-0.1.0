export { expect, expectError } from '@platform/test';
export { log } from '@platform/log/lib/server';
export * from '../common';

import { local } from '..';
import { Schema, fs } from '../common';

Schema.uri.ALLOW.NS = ['foo*'];

const TMP = fs.resolve('tmp');
export const PATH = {
  TMP,
  LOCAL: fs.join(TMP, 'local'),
};

export const writeFile = async (path: string, data: Buffer) => {
  await fs.ensureDir(fs.dirname(path));
  await fs.writeFile(path, data);
};

export const initLocal = () => local.init({ root: PATH.LOCAL });

export const util = {
  initLocal,
  PATH,
  fs,
  writeFile,
  env: fs.env.value,
  async image(path: string) {
    return fs.readFile(fs.join(fs.resolve(`src/test/images`), path));
  },
  async reset() {
    await fs.remove(TMP);
  },
};
