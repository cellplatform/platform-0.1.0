import * as fsExtra from 'fs-extra';
import * as path from 'path';

import { File } from '../file';
import { glob } from '../glob';
import { is } from '../is';
import { merge } from '../merge';
import { size } from '../size';
import { unzip, zip } from '../zip';

/**
 * Extended [file-system] object.
 */
export const fs = {
  ...fsExtra,

  /**
   * Helpers for determining the size of file-system items.
   */
  size,

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
   * Zip/unzip
   */
  zip,
  unzip,

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
