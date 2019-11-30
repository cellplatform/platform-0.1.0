export { expect, expectError } from '@platform/test';
export { log } from '@platform/log/lib/server';
export * from '../common';

import { fs } from '../common';
fs.env.load();

const TMP = fs.resolve('tmp');
export const PATH = {
  TMP,
  LOCAL: fs.join(TMP, 'local'),
};

export const util = {
  PATH,
  fs,
  env: fs.env.value,
  async loadImage(path: string) {
    return fs.readFile(fs.join(fs.resolve(`src/test/images`), path));
  },
  async reset() {
    await fs.remove(TMP);
  },
};
