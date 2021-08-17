import { t } from '../common';

/**
 * Factor for a machine that
 */
export type FilesystemIndexerFactory = (args: { fs: t.IFilesystem }) => FilesystemIndexer;

export type FilesystemIndexer = {
  /**
   *
   */
  manifest(): Promise<t.DirManifest>;
};
