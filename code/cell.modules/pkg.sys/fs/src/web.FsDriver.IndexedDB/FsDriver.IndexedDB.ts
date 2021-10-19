import { Subject } from 'rxjs';

import { IndexedDb } from './IndexedDb';
import { t } from './common';

/**
 * TODO 🐷
 *
 *    Implement: FsDriverLocal
 *
 */

//  type: Type;
//  dir: string;
//  resolve: FsPathResolver<ResolveOptions>;
//  info: FsInfoMethod<Info>;
//  read: FsReadMethod<Read>;
//  write: FsWriteMethod<Write, WriteOptions>;
//  copy: FsCopyMethod<Copy, CopyOptions>;
//  delete: FsDeleteMethod<Delete>;

/**
 * A filesystem driver running against the browser [IndexedDB] store.
 */
export const FsDriverIndexedDB = (args: { dir: string; name?: string }) => {
  return IndexedDb.create<t.FsDriverIndexedDB>({
    name: args.name || 'fs',
    version: 1,

    /**
     * Initialize the database schema.
     */
    schema(req, e) {
      console.group('🌳 init (schema)');
      console.log('res', req);
      console.log('e', e);
      console.groupEnd();

      // const db = open.result;
      // const store = db.createObjectStore(NAME.STORE, { keyPath: 'hash' });
      // const index = store.createIndex(NAME.INDEX, [
      //   'info.filename',
      //   'info.dir',
      //   'info.mimetype',
      //   'info.bytes',
      // ]);
    },

    /**
     * The database API implementation.
     */
    store(db) {
      const dispose$ = new Subject<void>();
      const dispose = () => {
        db.close();
        dispose$.next();
      };

      const api: t.FsDriverIndexedDB = {
        dispose$: dispose$.asObservable(),
        dispose,
        name: db.name,
        version: db.version,
        // put,
      };

      return api;
    },
  });
};
