import { t } from '../common';

type DirPath = string;

export type FsPathFilter = (e: FsPathFilterArgs) => boolean;
export type FsPathFilterArgs = { path: string; is: { dir: boolean; file: boolean } };

/**
 * Index of a file-system.
 */
export type FsIndexer = {
  dir: string; // Root directory of the file-system.
  manifest: FsIndexerGetManifest;
};

/**
 * Generate a directory listing manifest.
 */
export type FsIndexerGetManifest = (
  options?: FsIndexerGetManifestOptions,
) => Promise<t.DirManifest>;
export type FsIndexerGetManifestOptions = {
  dir?: DirPath;
  filter?: FsPathFilter;
  cache?: boolean | 'force' | 'remove'; // (default: no-cache) Caches a version of index manifest in the directory for faster retrieval.
  cachefile?: string; // Used in conjuction with [cache] flag. Filename of the cached manifest to save.
};
