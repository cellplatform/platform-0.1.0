import { fs } from '../common';

/**
 * Reads a resolved file-path.
 */
export function readFile(path: string) {
  return fs.readFile(fs.resolve(path));
}

/**
 * Load a set of test files.
 */
export async function testFiles() {
  const file1 = await readFile('src/test/assets/func.wasm');
  const file2 = await readFile('src/test/assets/kitten.jpg');
  const file3 = await readFile('src/test/assets/foo.json');
  return { file1, file2, file3 };
}
