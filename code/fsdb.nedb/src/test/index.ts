import { fs } from '@platform/fs';

export { fs };
export { expect, expectError } from '@platform/test';
export * from '../common';

after(async () => {
  await fs.remove(fs.resolve('./nedb:'));
});
