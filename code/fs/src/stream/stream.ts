import * as stream from 'stream';
import * as util from 'util';

import { ensureDir, createWriteStream, writeFile } from 'fs-extra';
import { dirname } from 'path';
import { t } from '../common';

const pipeline = util.promisify(stream.pipeline);

/**
 * Saves a readable stream to disk.
 */
export async function save(path: string, data: ReadableStream | t.Json | string) {
  try {
    await ensureDir(dirname(path));
    if (typeof data === 'string') {
      await writeFile(path, data);
      return;
    }

    if (typeof data === 'object') {
      const isStream = typeof (data as any).on === 'function';
      if (isStream) {
        // Stream.
        await pipeline(data as any, createWriteStream(path));
      } else {
        // JSON.
        await writeFile(path, JSON.stringify(data, null, '  '));
      }

      return;
    }

    throw new Error(`Type of data not saveable (${typeof data})`);
  } catch (err) {
    throw new Error(`Failed to save stream to '${path}'. ${err.message}`);
  }
}
