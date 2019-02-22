import { value } from '../common';
import { Db } from './Db.main';
import { Swarm } from '../swarm/main';

export { Db, Swarm };

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
  const db = await Db.create({ dir, dbKey });
  const swarm = await Swarm.create({ db, autoAuth, join });

  // Finish up.
  return { db, swarm };
}
