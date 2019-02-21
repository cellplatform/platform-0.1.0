import * as hyperdb from './db/main';
// import { Swarm } from './swarm/main';
import { setupSwarm } from './_tmp';

/**
 * Initializes a new hyperdb.
 */
export async function init(args: { dir: string; dbKey?: string }) {
  const { dir } = args;
  const db = await hyperdb.create({ storage: dir, key: args.dbKey });
  // const discoveryKey = db.discoveryKey.toString('hex');
  const dbKey = db.key.toString('hex');
  const localKey = db.local.key.toString('hex');
  // const swarm = new Swarm({ db, join: true, autoAuth: true });

  await setupSwarm({ db: db._.db });

  return {
    dir,
    dbKey,
    localKey,
    db,
    // swarm
  };
}

/**
 * [API]
 */
export { hyperdb as db };
export default {
  init,
  db: hyperdb,
};
