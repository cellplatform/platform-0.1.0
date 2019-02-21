import { Db } from './db/main';
import { Swarm } from './swarm/main';

export { Db, Swarm };
export * from './types';

/**
 * Initializes a new hyperdb.
 */
export async function init(args: { dir: string; dbKey?: string }) {
  const { dir, dbKey } = args;

  const storage = dir;
  const db = await Db.create({ storage, dbKey });
  const swarm = await Swarm.create({ db, autoAuth: true, join: true });

  return {
    dir,
    dbKey: db.key.toString('hex'),
    localKey: db.local.key.toString('hex'),
    db,
    swarm,
  };
}
