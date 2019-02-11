import { File } from '../file';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { glob } from '../glob';
import { merge } from '../merge';
import { is } from '../is';

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
   * Helpers for working with file content.
   */
  file: File,

  /**
   * Merges directories.
   */
  merge,

  /**
   * Flag helpers
   */
  is,

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
