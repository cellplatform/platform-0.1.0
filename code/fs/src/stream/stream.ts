import * as stream from 'stream';
import * as util from 'util';

import { ensureDir, createWriteStream } from 'fs-extra';
import { dirname } from 'path';

const pipeline = util.promisify(stream.pipeline);

/**
 * Saves a readable stream to disk.
 */
export async function save(path: string, data: NodeJS.ReadableStream) {
  try {
    await ensureDir(dirname(path));
    const output = createWriteStream(path);
    await pipeline(data as any, output);
  } catch (err) {
    throw new Error(`Failed to save stream to '${path}'. ${err.message}`);
  }
}
