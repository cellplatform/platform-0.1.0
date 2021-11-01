import { t, ROOT_DIR } from './common';

export function FsIndexer(args: { dir: string; db: IDBDatabase }) {
  const { dir } = args;

  const api: t.FsIndexer = {
    dir,

    /**
     * Generate a directory listing manifest.
     */
    async manifest(options = {}) {
      const { filter } = options;

      throw new Error('Not implemented: manifest');
    },
  };

  return api;
}
