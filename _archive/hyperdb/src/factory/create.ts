import { value } from '../common';
import { Db } from '../db';
import { Network } from '../network';
import * as t from '../types';

export { Db, Network };

/**
 * Create new HyperDB and connects it to the network.
 */
export const create: t.CreateDatabase = async args => {
  const { dir, dbKey, version } = args;
  const connect = value.defaultValue(args.connect, false);

  // Construct and connect the database.
  const db = await Db.create({ dir, dbKey, version });
  const network = Network.create({ db });
  if (connect) {
    network.connect();
  }

  // Finish up.
  return { db, network };
};
