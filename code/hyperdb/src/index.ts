import { value } from './common';
import { Db } from './db';
import { Swarm } from './swarm';

export { Db, Swarm };
export * from './types';

/**
 * Create new HyperDB and connect it to the network.
 */
export async function create(args: {
  dir: string;
  dbKey?: string;
  autoAuth?: boolean;
  join?: boolean;
  version?: string;
}) {
  const { dir, dbKey, version } = args;
  const autoAuth = value.defaultValue(args.autoAuth, true);
  const join = value.defaultValue(args.join, true);

  // Construct and connect the database.
  const db = await Db.create({ dir, dbKey, version });
  const swarm = await Swarm.create({ db, autoAuth, join });

  // Finish up.
  return { db, swarm };
}
