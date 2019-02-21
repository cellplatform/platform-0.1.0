import { HyperDb, Swarm } from './db';

// import * as hyperdb from './db/main';
// import { Swarm } from './swarm/main';
// import { setupSwarm } from './_tmp';

/**
 * Initializes a new hyperdb.
 */
export async function init(args: { dir: string; dbKey?: string }) {
  const { dir, dbKey } = args;

  const db = await HyperDb.create({ storage: dir, dbKey });
  const swarm = new Swarm({ db, autoAuth: true, join: true });

  return {
    dir,
    dbKey: db.key.toString('hex'),
    localKey: db.local.key.toString('hex'),
    db,
    swarm,
  };
}

/**
 * [API]
 */
export { HyperDb, Swarm };
export default {
  init,
  HyperDb,
  Swarm,
};
