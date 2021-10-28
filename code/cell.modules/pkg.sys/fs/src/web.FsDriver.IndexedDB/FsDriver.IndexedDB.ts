import { Subject } from 'rxjs';

import { IndexedDb } from './IndexedDb';
import { t, Hash, Format, Stream, ROOT_DIR, NAME } from './common';

/**
 * TODO 🐷
 *
 *    Implement: FsDriverLocal
 *
 */

type FilePath = string;
type FileHash = string;
type PathRecord = { path: FilePath; hash: FileHash; bytes: number };
type BinaryRecord = { hash: FileHash; data: Uint8Array };

/**
 * A filesystem driver running against the browser [IndexedDB] store.
 */
export const FsDriverIndexedDB = (args: { name?: string }) => {
  return IndexedDb.create<t.FsDriverIndexedDB>({
    name: args.name || 'fs',
    version: 1,

    /**
     * Initialize the database schema.
     */
    schema(req, e) {
      const db = req.result;
      db.createObjectStore(NAME.STORE.PATHS, { keyPath: 'path' });
      db.createObjectStore(NAME.STORE.FILES, { keyPath: 'hash' });
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

      const driver: t.FsDriverLocal = {
        type: 'LOCAL',
        dir: ROOT_DIR,

        /**
         * Convert the given string to an absolute path.
         */
        resolve(address, options) {
          throw new Error('Not implemented: resolve');
        },

        /**
         * Retrieve meta-data of a local file.
         */
        async info(uri) {
          const path = Format.uriToPath(uri, { throw: true });

          const tx = db.transaction(NAME.STORE.PATHS, 'readonly');
          const store = tx.objectStore(NAME.STORE.PATHS);

          const res = await IndexedDb.get<PathRecord>(store, path);
          const exists = Boolean(res);

          // const res = x

          // const res: t.IFsInfoLocal = {
          //   uri,
          // }

          throw new Error('Not implemented: info');
        },

        /**
         * Read from the local file-system.
         */
        async read(uri) {
          const path = Format.uriToPath(uri, { throw: true });
          const tx = db.transaction([NAME.STORE.PATHS, NAME.STORE.FILES], 'readonly');
          const store = {
            paths: tx.objectStore(NAME.STORE.PATHS),
            files: tx.objectStore(NAME.STORE.FILES),
          };

          const get = IndexedDb.get;
          const hash = (await get<PathRecord>(store.paths, path))?.hash || '';
          const data = hash ? (await get<BinaryRecord>(store.files, hash))?.data : undefined;

          let status = 200;
          let error: t.IFsError | undefined;
          if (!hash || !data) {
            status = 404;
            error = { type: 'FS/read', path, message: 'File not found' };
          }
          const file = !data
            ? undefined
            : { path, location: path, data, hash, bytes: data.byteLength };

          const ok = status.toString().startsWith('2');
          return { uri, ok, status, file, error };
        },

        async write(uri, file) {
          const path = Format.uriToPath(uri, { throw: true });
          const location = path;

          const isStream = Stream.isReadableStream(file);
          const data = file as Uint8Array; // TEMP 🐷

          const hash = Hash.sha256(data);
          const bytes = data.byteLength;

          // console.log('f', f);

          console.log('uri', uri);
          console.log('path', path);
          console.log('data', data);
          console.log('isStream', isStream);

          /**
           * TODO 🐷
           * - load stream (if required)
           * - remove old file/data reference if only one path reference.
           */

          const tx = db.transaction([NAME.STORE.PATHS, NAME.STORE.FILES], 'readwrite');
          const store = {
            paths: tx.objectStore(NAME.STORE.PATHS),
            files: tx.objectStore(NAME.STORE.FILES),
          };

          await Promise.all([
            IndexedDb.put<PathRecord>(store.paths, { path, hash, bytes }),
            IndexedDb.put<BinaryRecord>(store.files, { hash, data }),
          ]);

          return {
            uri,
            ok: true,
            status: 200,
            file: { path, location, hash, data, bytes },
          };
        },

        async delete(uri) {
          throw new Error('Not implemented: delete');
        },

        async copy(sourceUri, targetUri) {
          throw new Error('Not implemented: copy');
        },
      };

      const api: t.FsDriverIndexedDB = {
        dispose$: dispose$.asObservable(),
        dispose,
        name: db.name,
        version: db.version,
        driver,
      };

      return api;
    },
  });
};
