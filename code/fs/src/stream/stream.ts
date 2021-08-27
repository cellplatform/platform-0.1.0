import { createWriteStream, ensureDir, writeFile } from 'fs-extra';
import { dirname } from 'path';
import { pipeline, Writable } from 'stream';
import { promisify } from 'util';

import { stringify, t } from '../common';

const pipe = promisify(pipeline);

/**
 * Helpers for workint a streams.
 */
export const Stream = {
  /**
   * Determine if the given input is a readable stream.
   */
  isReadableStream(input: any) {
    return typeof input?.on === 'function' && input?.readable === true;
  },

  /**
   * Encode an input string to a UTF-8 encoded [Uint8Array].
   */
  encode(input?: string) {
    return new TextEncoder().encode(input);
  },

  /**
   * Decode a [Uint8Array] to a UTF-8 string.
   */
  decode(input?: BufferSource, options?: TextDecodeOptions) {
    return new TextDecoder().decode(input, options);
  },

  /**
   * Read the given stream into an [Uint8Array].
   */
  async toUint8Array(input: ReadableStream | t.Json): Promise<Uint8Array> {
    const isStream = Stream.isReadableStream(input);

    // Process JSON.
    if (!isStream) {
      const json = stringify(input as t.Json);
      return Stream.encode(json);
    }

    // Prepare a stream writer.
    const chunks: Uint8Array[] = [];
    const writer = new Writable({
      write(chunk, encoding, next) {
        chunks.push(Uint8Array.from(chunk));
        next();
      },
      final: (complete) => complete(),
    });

    // Process the stream.
    await pipe(input as any, writer);

    // Assemble the final buffer.
    const totalLength = chunks.reduce((acc, next) => acc + next.length, 0);
    const res = new Uint8Array(totalLength);
    chunks.reduce((offset, next) => {
      res.set(next, offset);
      return offset + next.length;
    }, 0);

    // Finish up.
    return res;
  },

  /**
   * Save a readable stream to disk.
   */
  async save(path: string, data: ReadableStream | t.Json) {
    try {
      if (data === undefined) throw new Error(`No data`);
      await ensureDir(dirname(path));

      // Stream
      if (Stream.isReadableStream(data)) {
        await pipe(data as any, createWriteStream(path));
        return;
      }

      // JSON
      await writeFile(path, stringify(data as t.Json));
    } catch (err) {
      throw new Error(`Failed to save stream to '${path}'. ${err.message}`);
    }
  },
};
