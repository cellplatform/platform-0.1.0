import { Schema } from '../web/common';
export * from '../web/common';

export const ROOT_DIR = '/';
export const NAME = {
  STORE: {
    PATHS: 'Paths',
    FILES: 'Files',
  },
  INDEX: {
    DIRS: 'DirIndex',
    HASH: 'HashIndex',
  },
};

export const LocalPath = Schema.File.Path.Local;

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
