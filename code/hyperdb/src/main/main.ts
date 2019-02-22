import * as db from '../helpers/db/main';
import { Swarm } from '../helpers/swarm/main';
import * as t from '../types';

export { Swarm };
export { Db } from '../helpers/db/main';
export * from '../types';

/**
 * Initializes a new HyperDB on the `main` process.
 */
export async function init(args: { ipc: t.IpcClient; log: t.ILog }) {
  await db.ipc.init({ ipc: args.ipc, log: args.log });
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
  return db.create(args);
}
