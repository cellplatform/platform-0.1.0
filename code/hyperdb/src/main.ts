import * as hyperdb from './db/main';
import { Swarm } from './swarm/main';

/**
 * Initializes a new hyperdb.
 */
export async function init(args: { dir: string; publicKey?: string }) {
  const { dir } = args;
  const db = await hyperdb.create({ storage: dir, key: args.publicKey });
  const publicKey = db.discoveryKey.toString('hex');
  const swarm = new Swarm({ db, id: publicKey, join: true, autoAuth: true });
  return { dir, publicKey, db, swarm };
}

/**
 * [API]
 */
export { hyperdb as db };
export default {
  init,
  db: hyperdb,
};
