import { Subject } from 'rxjs';

import { IndexedDb, NAME, ROOT_DIR, t } from './common';
import { FsDriver } from './FsDriver';
import { FsIndexer } from './FsIndexer';

/**
 * A filesystem driver running against the browser [IndexedDB] store.
 */
export const FsDriverLocal = (args: { id?: string }) => {
  const dir = ROOT_DIR;
  const id = (args.id ?? 'fs').trim();

  return IndexedDb.create<t.FsIndexedDb>({
    name: id,
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

      const { version } = db;
      let driver: t.FsDriverLocal | undefined;
      let index: t.FsIndexer | undefined;

      /**
       * API.
       */
      const api: t.FsIndexedDb = {
        id,
        version,
        dispose$: dispose$.asObservable(),
        dispose,
        get driver() {
          return driver || (driver = FsDriver({ dir, db }));
        },
        get index() {
          const fs = api.driver;
          return index || (index = FsIndexer({ dir, db, fs }));
        },
      };

      return api;
    },
  });
};
