import * as fsExtra from 'fs-extra';
import * as path from 'path';

import { t } from '../common';
import { File as file } from '../file';
import { glob } from '../glob';
import { is } from '../is';
import { merge } from '../merge';
import { size } from '../size';
import { unzip, zip } from '../zip';
import { ancestor } from '../ancestor';
import { match } from '../match';
import { env } from '../env';
import { stream } from '../stream';
import { sort } from '../sort';

const { join, resolve, dirname, basename, extname } = path;
const exists: t.IFs['exists'] = path => fsExtra.pathExists(path);
const writeFile: t.IFs['writeFile'] = fsExtra.writeFile;

/**
 * Extended [file-system] object.
 * NOTE:
 *    This [fs] object can be cast to the general
 *    `IFs` interface found in [@platform/types].
 */
export const fs = {
  ...fsExtra,

  /**
   * IFs (interface)
   */
  exists,
  writeFile,

  /**
   * Helpers for determining the size of file-system items.
   */
  size,

  /**
   * Helpers for working with streams.
   */
  stream,

  /**
   * Helpers for searching for glob patterns.
   */
  glob,

  /**
   * Helpers for semantically sorting filenames and paths.
   */
  sort,

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
  join,
  resolve,
  dirname,
  basename,
  extname,
};
