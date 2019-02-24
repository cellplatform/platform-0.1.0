import * as t from '../types';
import { RendererDb } from './renderer.Db';

export * from '../types';
export * from '@platform/electron/lib/renderer';

/**
 * Initializes a new HyperDB on the `renderer` process.
 */
export async function create(args: { ipc: t.IpcClient; dir: string; dbKey?: string }) {
  const { ipc, dir, dbKey } = args;
  const db = await RendererDb.create({ ipc, dir, dbKey });
  return { db };
}
