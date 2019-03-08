import { value, time } from './common';
import { Db } from './db';
import { Swarm } from './swarm';

export { Db, Swarm };
export * from './types';

import { Network } from './network';

/**
 * Create new HyperDB and connect it to the network.
 */
export async function create(args: {
  dir: string;
  dbKey?: string;
  connect?: boolean;
  version?: string;
}) {
  const { dir, dbKey, version } = args;
  const connect = value.defaultValue(args.connect, true);

  // Construct and connect the database.
  const db = await Db.create({ dir, dbKey, version });
  const network = Network.create({ db });
  if (connect) {
    network.connect();
  }

  // Finish up.
  return { db, network };
}
