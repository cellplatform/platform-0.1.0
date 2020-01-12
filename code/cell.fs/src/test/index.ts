export { expect, expectError } from '@platform/test';
export { log } from '@platform/log/lib/server';
export * from '../common';
import { s3 } from '..';

import { fs } from '../common';
fs.env.load();

const TMP = fs.resolve('tmp');
export const PATH = {
  TMP,
  LOCAL: fs.join(TMP, 'local'),
};

export const initS3 = (args: { path?: string } = {}) => {
  return s3.init({
    root: args.path || 'platform/tmp/test.cell.fs',
    endpoint: 'sfo2.digitaloceanspaces.com',
    accessKey: util.env('SPACES_KEY'),
    secret: util.env('SPACES_SECRET'),
  });
};

export const util = {
  initS3,
  PATH,
  fs,
  env: fs.env.value,
  async image(path: string) {
    return fs.readFile(fs.join(fs.resolve(`src/test/images`), path));
  },
  async reset() {
    await fs.remove(TMP);
  },
};
