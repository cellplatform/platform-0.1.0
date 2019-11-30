import { fs } from '../common';
fs.env.load();

export { expect, expectError } from '@platform/test';
export * from '../common';

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
