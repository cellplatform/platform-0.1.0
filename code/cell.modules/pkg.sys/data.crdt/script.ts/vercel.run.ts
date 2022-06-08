import { deploy } from './vercel';

/**
 * DEVELOPMENT
 */
(async () => {
  await deploy('tdb', 'tdb-sys-crdt', 'crdt.sys.db.team');
})();
