import { value } from '../helpers/common';
import { Db } from '../helpers/db/Db.main';
import { Swarm } from '../helpers/swarm/main';
import * as t from '../types';

export { Db, Swarm };
export * from '../types';

/**
 * Initializes a new HyperDB on the `main` process.
 */
export async function init(args: {
  ipc: t.IpcClient;
  dir: string;
  dbKey?: string;
  autoAuth?: boolean;
  join?: boolean;
}) {
  const { dir, dbKey } = args;
  const autoAuth = value.defaultValue(args.autoAuth, true);
  const join = value.defaultValue(args.join, true);

  const storage = dir;
  const db = await Db.create({ storage, dbKey });
  const swarm = await Swarm.create({ db, autoAuth, join });

  return {
    db,
    swarm,
    dir,
  };
}
