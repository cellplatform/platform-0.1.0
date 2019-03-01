import * as t from '../types';
import { RendererDb } from './RendererDb';
import { take } from 'rxjs/operators';

export * from '../types';
export * from '@platform/electron/lib/renderer';

type Ref = { db: t.IRendererDb; dir: string; version?: string };
type Refs = { [key: string]: Ref };
const refs: Refs = {};

/**
 * Initializes a new HyperDB on the `renderer` process.
 */
export async function create<D extends object = any>(args: {
  ipc: t.IpcClient;
  dir: string;
  dbKey?: string;
}) {
  const { ipc, dir, dbKey } = args;
  const db = (await RendererDb.create<D>({ ipc, dir, dbKey })) as t.IRendererDb<D>;
  return { db };
}

/**
 * Gets an existing instance of a DB, or creates a new one database.
 */
export async function getOrCreate<D extends object = any>(args: {
  ipc: t.IpcClient;
  dir: string;
  dbKey?: string;
  version?: string;
}): Promise<t.IRendererDb<D>> {
  // Check if the DB already exists in cache.
  const { dir, version, dbKey, ipc } = args;
  const refKey = toRefKey({ dir, version });
  if (refs[refKey]) {
    return refs[refKey].db;
  }

  // Create the DB.
  const db = (await create<D>({ ipc, dir, dbKey })).db;
  refs[refKey] = { db, dir, version };
  db.dispose$.pipe(take(1)).subscribe(e => delete refs[refKey]);

  // Finish up.
  return db;
}

/**
 * Retrieves a DB from the cache (if it exists).
 */
export function fromCache<D extends object = any>(args: {
  dir: string;
  version?: string;
}): t.IRendererDb<D> | undefined {
  const ref = refs[toRefKey(args)];
  return ref ? ref.db : undefined;
}

/**
 * INTERNAL
 */

function toRefKey(args: { dir: string; version?: string }) {
  const { dir, version } = args;
  return version ? `${dir}/ver:${version}` : dir;
}
