import { HyperDb } from './HyperDb';
import { Swarm } from './Swarm';

export { HyperDb, Swarm };

// /**
//  * Initialize the DB.
//  */
// export async function init(args: { dir: string; dbKey?: string }) {
//   const { dir, dbKey } = args;

//   const db = await HyperDb.create({ storage: dir, dbKey });
//   const swarm = new Swarm({ db, autoAuth: true, join: true });

//   return {
//     dbKey: db.key.toString('hex'),
//     localKey: db.local.key.toString('hex'),
//     db,
//     swarm,
//   };
// }
