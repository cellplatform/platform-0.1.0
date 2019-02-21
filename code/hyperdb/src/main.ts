import { HyperDb, Swarm } from './main.db';
export { HyperDb, Swarm };

/**
 * Initializes a new hyperdb.
 */
export async function init(args: { dir: string; dbKey?: string }) {
  const { dir, dbKey } = args;

  const db = await HyperDb.create({ storage: dir, dbKey });
  const swarm = await Swarm.create({ db, autoAuth: true, join: true });

  return {
    dir,
    dbKey: db.key.toString('hex'),
    localKey: db.local.key.toString('hex'),
    db,
    swarm,
  };
}
