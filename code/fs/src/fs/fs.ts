import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { glob } from '../glob';

/**
 * Extended [file-system] object.
 */
export const fs = {
  ...fsExtra,

  /**
   * Helpers for searching for glob patterns.
   */
  glob,

  /**
   * Helpers for working with paths.
   */
  path,
  join: path.join,
  resolve: path.resolve,
  dirname: path.dirname,
  basename: path.basename,
  extname: path.extname,
};
