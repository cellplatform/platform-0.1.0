import { value } from '../helpers/common';
import { Db } from '../helpers/db/Db.renderer';
import * as t from '../types';

export * from '../types';
export * from '@platform/electron/lib/renderer';

/**
 * Initializes a new HyperDB on the `renderer` process.
 */
export async function create(args: { ipc: t.IpcClient; dir: string; dbKey?: string }) {
  const { ipc, dir, dbKey } = args;

  console.group('🌳 renderer');
  console.log('args', args);

  const db = await Db.create({ ipc, dir, dbKey });

  console.log('db', db);
  console.groupEnd();
  // return {
  //   dbKey: db.buffer.key.toString('hex'),
  //   localKey: db.buffer.localKey.toString('hex'),
  //   db,
  //   swarm,
  //   dir,
  // };
  return { db };
}
