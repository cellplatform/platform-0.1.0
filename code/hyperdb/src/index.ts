import { value } from './common';
import { Db } from './db';
import { Network } from './network';

export { Db, Network };
export * from './types';

/**
 * Create new HyperDB and connect it to the network.
 */
export async function create<D extends object = any>(args: {
  dir: string;
  dbKey?: string;
  connect?: boolean;
  version?: string;
}) {
  const { dir, dbKey, version } = args;
  const connect = value.defaultValue(args.connect, true);

  // Construct and connect the database.
  const db = await Db.create<D>({ dir, dbKey, version });
  const network = Network.create({ db });
  if (connect) {
    network.connect();
  }

  // Finish up.
  return { db, network };
}
