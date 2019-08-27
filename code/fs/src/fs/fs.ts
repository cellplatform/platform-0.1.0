import * as fsExtra from 'fs-extra';
import * as path from 'path';

import { File as file } from '../file';
import { glob } from '../glob';
import { is } from '../is';
import { merge } from '../merge';
import { size } from '../size';
import { unzip, zip } from '../zip';
import { ancestor } from '../ancestor';
import { match } from '../match';
import { env } from '../env';

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
  file,

  /**
   * Helpers for walking up the ancestor hierarchy.
   */
  ancestor,

  /**
   * Merges directories.
   */
  merge,

  /**
   * Match file patterns.
   */
  match,

  /**
   * Flag helpers.
   */
  is,

  /**
   * Load .env files into process.env.
   */
  env,

  /**
   * Zipping.
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
