import { value } from './common';
import { Db } from './db/main';
import { Swarm } from './swarm/main';

export { Db, Swarm };
export * from './types';

/**
 * [main] Initializes a new `hyperdb`.
 */
export async function init(args: {
  dir: string;
  dbKey?: string;
  autoAuth?: boolean;
  join?: boolean;
}) {
  const { dir, dbKey } = args;
  const autoAuth = value.defaultValue(args.autoAuth, true);
  const join = value.defaultValue(args.join, true);

  const storage = dir;
  const db = await Db.create({ storage, dbKey });
  const swarm = await Swarm.create({ db, autoAuth, join });

  return {
    dbKey: db.buffer.key.toString('hex'),
    localKey: db.buffer.localKey.toString('hex'),
    db,
    swarm,
    dir,
  };
}
