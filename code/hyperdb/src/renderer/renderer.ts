import { value } from '../helpers/common';

export * from '../types';
export * from '@platform/electron/lib/renderer';

/**
 * Initializes a new HyperDB on the `renderer` process.
 */
export async function init(args: {
  dir: string;
  dbKey?: string;
  autoAuth?: boolean;
  join?: boolean;
}) {
  console.log('args', args);

  const { dir, dbKey } = args;
  const autoAuth = value.defaultValue(args.autoAuth, true);
  const join = value.defaultValue(args.join, true);

  console.group('🌳 renderer');
  console.log('autoAuth', autoAuth);
  console.log('join', join);
  console.groupEnd();

  // const storage = dir;
  // const db = await Db.create({ storage, dbKey });
  // const swarm = await Swarm.create({ db, autoAuth, join });

  // return {
  //   dbKey: db.buffer.key.toString('hex'),
  //   localKey: db.buffer.localKey.toString('hex'),
  //   db,
  //   swarm,
  //   dir,
  // };
}
