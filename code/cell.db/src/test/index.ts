import { Schema } from '@platform/cell.schema';

import { fs } from '@platform/fs';
import { NeDb } from '@platform/fsdb.nedb';

export { fs };

export { expect, expectError } from '@platform/test';
export { time } from '@platform/util.value';
export * from '../common';

import { util } from '../common';
export const hash = util.cell.value.hash;

let count = 0;
const dir = fs.resolve('tmp/test');

before(() => {
  Schema.uri.ALLOW.NS = ['abcd', 'foo', 'bar', 'zoo', 'foobar'];
});

after(() => fs.remove(dir)); // Clean up after all tests.

/**
 * Constructs a DB for the purposes of testing.
 */
export async function getTestDb(
  options: { file?: boolean; reset?: boolean; compact?: boolean } = {},
) {
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

  if (options.compact) {
    await db.compact();
  }

  return db;
}

/**
 * Gets the hash of an image file.
 */
export async function getFileHash(filename = 'kitten.jpg') {
  const image = await fs.readFile(fs.resolve(`src/test/images/${filename}`));
  return hash.sha256(image);
}
