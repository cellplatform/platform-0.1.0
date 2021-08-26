import { t, stringify } from './common';
import { ReadStreamWeb } from '../web.Stream';

import stream from 'stream';
import { promisify } from 'util';
const pipeline = promisify(stream.pipeline);

const { isReadableStream, encode, decode } = ReadStreamWeb;

/**
 * Work with a readable stream.
 *
 *    - https://developer.mozilla.org/en-US/docs/Web/API/ReadStream
 *    - https://developer.mozilla.org/en-US/docs/Web/API/Streams_API#concepts_and_usage
 *    - https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
 *
 */
export const ReadStreamNode = {
  isReadableStream,
  encode,
  decode,

  /**
   * Read the given stream into an [Int8Array].
   */
  async toUint8Array(input: ReadableStream | t.Json): Promise<Uint8Array> {
    const isStream = isReadableStream(input);

    // Process JSON.
    if (!isStream) {
      const json = stringify(input as t.Json);
      return encode(json);
    }

    // Process the stream.
    const chunks: Uint8Array[] = [];
    var writable = new stream.Writable({
      write(chunk, encoding, next) {
        chunks.push(Uint8Array.from(chunk));
        next();
      },
      final: (complete) => complete(),
    });

    await pipeline(input as any, writable);

    // Assemble the final buffer.
    const totalLength = chunks.reduce((acc, next) => acc + next.length, 0);
    const merged = new Uint8Array(totalLength);
    chunks.reduce((offset, next) => {
      merged.set(next, offset);
      return offset + next.length;
    }, 0);

    // Finish up.
    return merged;
  },
};
