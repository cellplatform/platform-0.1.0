import { t, stringify } from './common';

/**
 * Work with a readable stream.
 *
 *    - https://developer.mozilla.org/en-US/docs/Web/API/ReadStream
 *    - https://developer.mozilla.org/en-US/docs/Web/API/Streams_API#concepts_and_usage
 *    - https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
 *
 */
export const Stream = {
  /**
   * Determine if the given input is a readable stream.
   */
  isReadableStream(input: any) {
    return typeof ReadableStream !== 'function'
      ? typeof input?.on === 'function' && input?.readable === true // Node-js.
      : input instanceof ReadableStream; // Web.
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
   * WEB: Read the given stream into an [Uint8Array].
   */
  async toUint8Array(input: ReadableStream | t.Json | Uint8Array): Promise<Uint8Array> {
    if (input instanceof Uint8Array) return input;
    const isStream = Stream.isReadableStream(input);

    // Process JSON.
    if (!isStream) {
      const json = typeof input === 'string' ? input : stringify(input as t.Json);
      return Stream.encode(json);
    }

    const stream = input as ReadableStream;
    if (typeof stream?.getReader !== 'function') {
      throw new Error(`Stream does not have 'getReader' function.`);
    }

    const reader = stream.getReader() as ReadableStreamDefaultReader<Uint8Array>;
    const chunks: Uint8Array[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read();
      if (value) chunks.push(value);
      if (done) break;
    }

    const totalLength = chunks.reduce((acc, next) => acc + next.length, 0);
    const res = new Uint8Array(totalLength);
    chunks.reduce((offset, next) => {
      res.set(next, offset);
      return offset + next.length;
    }, 0);

    return res;
  },
};
