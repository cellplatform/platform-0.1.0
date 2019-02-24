import { value } from '../helpers/common';
import { Db } from '../helpers/db';
import { Swarm } from '../helpers/swarm/main';

export { Db, Swarm };
export * from '../types';

/**
 * Create a new network connected HyperDB on the `main` process.
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
