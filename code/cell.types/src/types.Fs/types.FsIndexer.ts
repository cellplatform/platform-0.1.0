import { t } from '../common';

type DirPath = string;

export type FsPathFilter = (e: FsPathFilterArgs) => boolean;
export type FsPathFilterArgs = { path: string; is: { dir: boolean; file: boolean } };

/**
 * Index of a file-system.
 */
export type FsIndexer = {
  dir: string; // Root directory of the file-system.

  /**
   * Generate a directory listing manifest.
   */
  manifest(options?: { dir?: DirPath; filter?: FsPathFilter }): Promise<t.DirManifest>;
};
