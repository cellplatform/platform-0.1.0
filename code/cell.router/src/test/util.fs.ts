import { fs, t } from '../common';

/**
 * Reads a resolved file-path.
 */
export async function readFile(path: string) {
  const file = await fs.readFile(fs.resolve(path));
  return new Uint8Array(file);
}

export async function writeThenReadStream(
  path: string,
  data: ReadableStream<Uint8Array> | undefined | t.Json,
) {
  path = fs.resolve(path);
  await fs.stream.save(path, data);
  return readFile(path);
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
