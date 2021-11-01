import { Subject } from 'rxjs';

import { IndexedDb, NAME, ROOT_DIR, Schema, t } from './common';
import { FsDriver } from './FsDriver';
import { FsIndexer } from './FsIndexer';

/**
 * A filesystem driver running against the browser [IndexedDB] store.
 */
export const FsIndexedDb = (args: { name?: string }) => {
  const dir = ROOT_DIR;

  return IndexedDb.create<t.FsIndexedDb>({
    name: args.name || 'fs',
    version: 1,

    /**
     * Initialize the database schema.
     */
    schema(req, e) {
      const db = req.result;
      const store = {
        paths: db.createObjectStore(NAME.STORE.PATHS, { keyPath: 'path' }),
        files: db.createObjectStore(NAME.STORE.FILES, { keyPath: 'hash' }),
      };
      store.paths.createIndex(NAME.INDEX.DIRS, ['dir']);
      store.paths.createIndex(NAME.INDEX.HASH, ['hash']);
    },

    /**
     * The database driver API implementation.
     */
    store(db) {
      const dispose$ = new Subject<void>();
      const dispose = () => {
        db.close();
        dispose$.next();
      };

      const { name, version } = db;
      let driver: t.FsDriverLocal | undefined;
      let index: t.FsIndexer | undefined;

      /**
       * API.
       */
      const api: t.FsIndexedDb = {
        dispose$: dispose$.asObservable(),
        dispose,
        name,
        version,
        get driver() {
          return driver || (driver = FsDriver({ dir, db }));
        },
        get index() {
          return index || (index = FsIndexer({ dir, db }));
        },
      };
      return api;
    },
  });
};
