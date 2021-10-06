import { t } from '../node/common';
import { PassThrough } from 'stream';

/**
 * Take a UInt8Array and convert it into a format appropriate
 * for the "Tus" streaming upload client.
 *
 * On [node-js] this is a [ReadableStream].
 */
export const convertUploadFile: t.ConvertUploadFile = (uint8Array) => {
  const stream = new PassThrough();
  stream.end(uint8Array);
  return stream;
};
