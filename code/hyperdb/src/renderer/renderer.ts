import { value } from '../helpers/common';
import { Db } from '../helpers/db/Db.renderer';
import * as t from '../types';

export * from '../types';
export * from '@platform/electron/lib/renderer';

/**
 * Initializes a new HyperDB on the `renderer` process.
 */
export async function create(args: {
  ipc: t.IpcClient;
  dir: string;
  dbKey?: string;
  autoAuth?: boolean;
  join?: boolean;
}) {
  const { ipc, dir, dbKey } = args;
  const autoAuth = value.defaultValue(args.autoAuth, true);
  const join = value.defaultValue(args.join, true);

  console.group('🌳 renderer');
  console.log('args', args);

  const storage = dir;
  const db = await Db.create({ ipc, storage, dbKey });
  // const swarm = await Swarm.create({ db, autoAuth, join });

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
