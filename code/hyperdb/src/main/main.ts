import { value } from '../helpers/common';
import { Db, ipc } from '../helpers/db/main';
import { Swarm } from '../helpers/swarm/main';

import * as t from '../types';

export { Db, Swarm };
export * from '../types';

/**
 * Initializes a new HyperDB on the `main` process.
 */
export async function init(args: { ipc: t.IpcClient; log: t.ILog }) {
  await ipc.init({ ipc: args.ipc, log: args.log });
}

/**
 * Creates a new network connected HyperDB on the `main` process.
 */
export async function create(args: {
  dir: string;
  dbKey?: string;
  autoAuth?: boolean;
  join?: boolean;
}) {
  const { dir, dbKey } = args;
  const autoAuth = value.defaultValue(args.autoAuth, true);
  const join = value.defaultValue(args.join, true);

  // Construct and connect the database.
  const storage = dir;
  const db = await Db.create({ storage, dbKey });
  const swarm = await Swarm.create({ db, autoAuth, join });

  // Finish up.
  return { db, swarm };
}
