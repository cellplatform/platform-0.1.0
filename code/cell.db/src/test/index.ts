import { fs } from '@platform/fs';
import { NeDb } from '@platform/fsdb.nedb';

export { fs };

export { expect, expectError } from '@platform/test';
export { time } from '@platform/util.value';
export * from '../common';

let count = 0;
const dir = fs.resolve('tmp/test');
after(() => fs.remove(dir)); // Clean up after all tests.

/**
 * Constructs a DB for the purposes of testing.
 */
export async function getTestDb(options: { file?: boolean; reset?: boolean } = {}) {
  let filename: string | undefined;

  if (options.reset) {
    await fs.remove(dir);
  }

  if (options.file) {
    count++;
    const file = `test-${count}.db`;
    await fs.ensureDir(dir);
    filename = fs.join(dir, file);
  }
  const db = NeDb.create({ filename });
  return db;
}
