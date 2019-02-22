import { Db } from '../helpers/db/renderer.Db';
import * as t from '../types';

export * from '../types';
export * from '@platform/electron/lib/renderer';

/**
 * Initializes a new HyperDB on the `renderer` process.
 */
export async function create(args: { ipc: t.IpcClient; dir: string; dbKey?: string }) {
  const { ipc, dir, dbKey } = args;
  const db = await Db.create({ ipc, dir, dbKey });
  return { db };
}
