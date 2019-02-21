import * as db from './db/main';

export { db };

/**
 * Initializes a new hyperdb.
 */
export async function init(args: db.ICreateDbArgs) {
  console.log('context', args);

  console.group('🌳 init db ');
  console.log(' - storage', args.storage);
  console.log(' - key', args.key);

  const hyperdb = await db.create(args);
  console.log('hyperdb', hyperdb);
  console.groupEnd();
}

export default {
  init,
  db,
};
