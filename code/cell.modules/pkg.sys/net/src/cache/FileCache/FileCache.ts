import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
} from 'rxjs/operators';
import { t } from '../../common';
import * as types from './types';

const NAME = {
  STORE: 'FileStore',
  INDEX: 'FilenameIndex',
};

type FileRecord = {
  hash: string; // SHA256 file hash.
  blob: Blob;
  info: FileInfo;
};
type FileInfo = {
  filename: string;
  dir: string;
  mimetype: string;
  bytes: number;
};

/**
 * Caches files within an IndexedDB.
 *
 *    https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 *    https://gist.github.com/JamesMessinger/a0d6389a5d0e3a24814b
 *    https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
 *
 */
export const FileCache = (name: string, version?: number) => {
  return new Promise<types.FileCache>((resolve, reject) => {
    try {
      const open = indexedDB.open(name, version ?? 1);

      open.onsuccess = () => {
        resolve(FileCacheDb(open.result));
      };

      open.onerror = () => {
        reject(new Error(`Failed while opening database '${name}'. ${open.error?.message}`));
      };

      open.onupgradeneeded = (e) => {
        console.log('onupgradeneeded', e);
        const db = open.result;
        const store = db.createObjectStore(NAME.STORE, { keyPath: 'hash' });
        const index = store.createIndex(NAME.INDEX, [
          'info.filename',
          'info.dir',
          'info.mimetype',
          'info.bytes',
        ]);
      };
    } catch (error) {
      const err = `Failed while opening database '${name}'. ${error.message}`;
      reject(new Error(err));
    }
  });
};

/**
 * Implementation.
 */
const FileCacheDb = (db: IDBDatabase): types.FileCache => {
  const dispose$ = new Subject<void>();
  const dispose = () => {
    db.close();
    dispose$.next();
  };

  const put = (file: t.PeerFile) => {
    return new Promise<t.PeerFile>((resolve, reject) => {
      const tx = db.transaction(NAME.STORE, 'readwrite');
      const store = tx.objectStore(NAME.STORE);

      const { hash, filename, dir, blob } = file;
      const mimetype = blob.type;
      const bytes = blob.size;

      const info: FileInfo = { filename, dir, mimetype, bytes };
      const record: FileRecord = { hash, info, blob };
      const req = store.put(record);

      req.onsuccess = () => resolve(file);
      req.onerror = () => reject(req.error);
    });
  };

  const get = {
    byHash(hash: string) {
      const tx = db.transaction(NAME.STORE, 'readonly');

      const store = tx.objectStore(NAME.STORE);

      return new Promise<t.PeerFile | undefined>((resolve, reject) => {
        const get = store.get(hash);
        get.onsuccess = () => {
          if (!get.result) return resolve(undefined);
          const { hash, blob, info } = get.result as FileRecord;
          const { filename, dir } = info;
          resolve({ hash, filename, dir, blob });
        };
        get.onerror = () => reject(get.error);
      });
    },
  };

  return {
    dispose$: dispose$.asObservable(),
    dispose,
    name: db.name,
    version: db.version,
    get,
    put,
  };
};
