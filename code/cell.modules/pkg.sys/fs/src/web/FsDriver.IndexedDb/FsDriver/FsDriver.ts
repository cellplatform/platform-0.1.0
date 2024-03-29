import { FsDriverLocalResolver } from '@platform/cell.fs/lib/Resolver.Local';

import {
  Hash,
  DbLookup,
  NAME,
  Path,
  Schema,
  Stream,
  t,
  deleteUndefined,
  Image,
  IndexedDb,
} from '../common';

const LocalFile = Schema.File.Path.Local;

/**
 * A filesystem driver running against the browser [IndexedDB] store.
 */
export function FsDriver(args: { dir: string; db: IDBDatabase }) {
  const { dir, db } = args;
  const root = dir;
  const lookup = DbLookup(db);

  const driver: t.FsDriverLocal = {
    type: 'LOCAL',

    /**
     * Root directory of the file system.
     * NOTE:
     *    This will always be "/". The IndexedDb implementation of the driver
     *    works with it's own root database and is not a part of a wider file-system.
     */
    dir,

    /**
     * Convert the given string to an absolute path.
     */
    resolve: FsDriverLocalResolver({ dir }),

    /**
     * Retrieve meta-data of a local file.
     */
    async info(uri) {
      uri = (uri || '').trim();
      const path = driver.resolve(uri).path;
      const location = LocalFile.toAbsoluteLocation({ path, root });

      type T = t.IFsInfoLocal;
      let kind: T['kind'] = 'unknown';
      let hash: T['hash'] = '';
      let bytes: T['bytes'] = -1;

      const pathRes = await lookup.path(path);
      if (pathRes) {
        kind = 'file';
        hash = pathRes.hash;
        bytes = pathRes.bytes;
      }

      if (!pathRes) {
        const dirRes = await lookup.dir(path);
        if (dirRes) kind = 'dir';
      }

      const exists = kind !== 'unknown';
      return { uri, exists, kind, path, location, hash, bytes };
    },

    /**
     * Read from the local file-system.
     */
    async read(uri) {
      const tx = db.transaction([NAME.STORE.PATHS, NAME.STORE.FILES], 'readonly');
      const store = {
        paths: tx.objectStore(NAME.STORE.PATHS),
        files: tx.objectStore(NAME.STORE.FILES),
      };

      uri = (uri || '').trim();
      const path = driver.resolve(uri).path;
      const location = LocalFile.toAbsoluteLocation({ path, root });

      const get = IndexedDb.record.get;
      const hash = (await get<t.PathRecord>(store.paths, path))?.hash || '';
      const data = hash ? (await get<t.BinaryRecord>(store.files, hash))?.data : undefined;
      const bytes = data ? data.byteLength : -1;

      let status = 200;
      let error: t.IFsError | undefined;
      if (!hash || !data) {
        status = 404;
        error = { type: 'FS/read', path, message: `[${uri}] does not exist` };
      }
      const file = !data ? undefined : { path, location, data, hash, bytes };
      const ok = status.toString().startsWith('2');
      return { uri, ok, status, file, error };
    },

    /**
     * Write to the local file-system.
     */
    async write(uri, input) {
      if (input === undefined) {
        throw new Error(`No data`);
      }

      uri = (uri || '').trim();
      const path = driver.resolve(uri).path;
      const location = LocalFile.toAbsoluteLocation({ path, root });
      const { dir } = Path.parts(path);

      const isStream = Stream.isReadableStream(input);
      const data = (isStream ? await Stream.toUint8Array(input) : input) as Uint8Array;

      const hash = Hash.sha256(data);
      const bytes = data.byteLength;
      const file = { path, location, hash, data, bytes };

      try {
        if (!path || path === root) throw new Error(`Path out of scope`);
        const image = await Image.toInfo(path, data);

        // Delete existing.
        // NB:  This ensures the hash-referenced file-record is removed if
        //      this are no other paths referencing the file-hash.
        await driver.delete(uri);

        // Perform write.
        const tx = db.transaction([NAME.STORE.PATHS, NAME.STORE.FILES], 'readwrite');
        const store = {
          paths: tx.objectStore(NAME.STORE.PATHS),
          files: tx.objectStore(NAME.STORE.FILES),
        };

        const put = IndexedDb.record.put;
        await Promise.all([
          put<t.PathRecord>(store.paths, deleteUndefined({ path, dir, hash, bytes, image })),
          put<t.BinaryRecord>(store.files, { hash, data }),
        ]);

        // Finish up.
        return { uri, ok: true, status: 200, file };
      } catch (err: any) {
        const message = `Failed to write [${uri}]. ${err.message}`;
        const error: t.IFsError = { type: 'FS/write', message, path };
        return { ok: false, status: 500, uri, file, error };
      }
    },

    /**
     * Delete from the local file-system.
     */
    async delete(uri) {
      const uris = (Array.isArray(uri) ? uri : [uri]).map((uri) => (uri || '').trim());
      const paths = uris.map((uri) => driver.resolve(uri).path);
      const locations = paths.map((path) => LocalFile.toAbsoluteLocation({ path, root }));

      const tx = db.transaction([NAME.STORE.PATHS, NAME.STORE.FILES], 'readwrite');
      const store = {
        paths: tx.objectStore(NAME.STORE.PATHS),
        files: tx.objectStore(NAME.STORE.FILES),
      };
      const index = {
        hash: store.paths.index(NAME.INDEX.HASH),
      };

      const remove = async (path: string) => {
        // Lookup the [Path] meta-data record.
        const pathRecord = await IndexedDb.record.get<t.PathRecord>(store.paths, path);
        if (!pathRecord) return;

        // Determine if the file (hash) is referenced by any other paths.
        const hash = pathRecord.hash;
        const hashRefs = await IndexedDb.record.getAll<t.PathRecord>(index.hash, [hash]);
        const isLastRef = hashRefs.filter((item) => item.path !== path).length === 0;

        // Delete the [Path] meta-data record.
        await IndexedDb.record.delete<t.PathRecord>(store.paths, path);

        // Delete the file-data if there are no other path's referencing the file.
        if (isLastRef) await IndexedDb.record.delete<t.BinaryRecord>(store.files, hash);
      };

      try {
        await Promise.all(paths.map(remove));
        return { ok: true, status: 200, uris, locations };
      } catch (err: any) {
        const error: t.IFsError = {
          type: 'FS/delete',
          message: `Failed to delete [${uri}]. ${err.message}`,
          path: paths.join(','),
        };
        return { ok: false, status: 500, uris, locations, error };
      }
    },

    /**
     * Copy a file.
     */
    async copy(sourceUri, targetUri) {
      const format = (input: string) => {
        const uri = (input || '').trim();
        const path = driver.resolve(uri).path;
        return { uri, path };
      };

      const source = format(sourceUri);
      const target = format(targetUri);

      const done = (status: number, hash: string, error?: t.IFsError) => {
        const ok = status.toString().startsWith('2');
        return { ok, status, hash, source: source.uri, target: target.uri, error };
      };

      const createPathReference = async (sourceInfo: t.IFsInfoLocal, targetPath: string) => {
        const tx = db.transaction([NAME.STORE.PATHS, NAME.STORE.FILES], 'readwrite');
        const store = tx.objectStore(NAME.STORE.PATHS);
        const { dir } = Path.parts(targetPath);
        const { hash, bytes } = sourceInfo;
        await IndexedDb.record.put<t.PathRecord>(store, { path: targetPath, dir, hash, bytes });
      };

      try {
        const info = await driver.info(source.uri);
        if (!info.exists) throw new Error(`Source file does not exist.`);
        await createPathReference(info, target.path);
        return done(200, info.hash);
      } catch (err: any) {
        const message = `Failed to copy from [${source.uri}] to [${target.uri}]. ${err.message}`;
        const error: t.IFsError = {
          type: 'FS/copy',
          message,
          path: target.path,
        };
        const hash = '';
        return done(500, hash, error);
      }
    },
  };

  return driver;
}
