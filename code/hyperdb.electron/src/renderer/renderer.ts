import { take } from 'rxjs/operators';

import * as t from '../types';
import { DbRenderer } from './renderer.Db';
import { NetworkRenderer } from './renderer.Network';

export * from '../types';
export * from '@platform/electron/lib/renderer';

type Ref = { db: t.IDbRenderer; network: t.INetworkRenderer; dir: string; version?: string };
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
  const db = (await DbRenderer.create<D>({ ipc, dir, dbKey })) as t.IDbRenderer<D>;
  const network = (await NetworkRenderer.create({ db, ipc })) as t.INetworkRenderer;
  return { db, network };
}

/**
 * Gets an existing instance of a DB, or creates a new one database.
 */
export function get<D extends object = any>(args: { dir: string; version?: string }) {
  const { dir, version } = args;
  const refKey = toRefKey({ dir, version });
  const ref = refs[refKey];
  if (!ref) {
    return undefined;
  }
  const db = ref.db as t.IDbRenderer<D>;
  const network = ref.network;
  return { db, network };
}

/**
 * Gets an existing instance of a DB, or creates a new one database.
 */
export async function getOrCreate<D extends object = any>(args: {
  ipc: t.IpcClient;
  dir: string;
  dbKey?: string;
  version?: string;
}) {
  const { dir, version, dbKey, ipc } = args;

  // Check if the DB already exists in cache.
  const existing = get({ dir, version });
  if (existing) {
    return existing;
  }

  // Create the DB.
  const { db, network } = await create<D>({ ipc, dir, dbKey });

  // Store the reference in cache.
  const refKey = toRefKey({ dir, version });
  refs[refKey] = { db, network, dir, version };
  db.dispose$.pipe(take(1)).subscribe(e => delete refs[refKey]);

  // Finish up.
  return { db, network };
}

/**
 * Retrieves a DB from the cache (if it exists).
 */
export function fromCache<D extends object = any>(args: {
  dir: string;
  version?: string;
}): t.IDbRenderer<D> | undefined {
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
