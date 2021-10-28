import { Schema } from '../web/common';
export * from '../web/common';

export const ROOT_DIR = '';
export const NAME = {
  STORE: {
    PATHS: 'paths',
    FILES: 'files',
  },
};

export const LocalPath = Schema.File.Path.Local;

/**
 * String formattting.
 */
export const Format = {
  uriToPath(input?: string, options: { throw?: boolean } = {}) {
    let path = (input || '').trim();
    if (options.throw && !path.startsWith('path:'))
      throw new Error(`Expecting "path:" URI prefix.`);
    path = path.replace(/^path\:/, '');
    return LocalPath.toAbsolutePath({ path, root: ROOT_DIR });
  },
};

/**
 * File stream
 */
const Stream = {
  isReadableStream(input?: any) {
    if (typeof input !== 'object') return false;
    const stream = input as ReadableStream<any>;
    return typeof stream.getReader === 'function';
  },
};
