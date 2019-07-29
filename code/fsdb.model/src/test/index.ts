import { NeDoc } from '../common';
import { fs } from '@platform/fs';
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
export async function getTestDb(options: { file?: boolean } = {}) {
  let filename;
  if (options.file) {
    count++;
    const file = `test-${count}.db`;
    await fs.ensureDir(dir);
    filename = fs.join(dir, file);
  }
  const db = NeDoc.create({ filename });
  return db;
}
