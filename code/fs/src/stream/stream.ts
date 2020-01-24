import * as stream from 'stream';
import * as util from 'util';

import { ensureDir, createWriteStream, writeFile } from 'fs-extra';
import { dirname } from 'path';

const pipeline = util.promisify(stream.pipeline);

/**
 * Saves a readable stream to disk.
 */
export async function save(path: string, data: ReadableStream | string) {
  try {
    await ensureDir(dirname(path));
    if (typeof data === 'string') {
      await writeFile(path, data);
    } else {
      const output = createWriteStream(path);
      await pipeline(data as any, output);
    }
  } catch (err) {
    throw new Error(`Failed to save stream to '${path}'. ${err.message}`);
  }
}
