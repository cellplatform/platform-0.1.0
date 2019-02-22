import main from '../src/main';
import * as uiharness from '@uiharness/electron/lib/main';
const config = require('../.uiharness/config.json');

(async () => {
  const context = await uiharness.init({ config });
  const { log } = context;
  const ipc = context.ipc as main.DbIpcClient;
  await initDb({ log, ipc });

  // const res = await main.db.init({ db: 'db1' });

  // const { id } = this.context;
})();

/**
 * Initialize the [main] hyperdb.
 */
async function initDb(args: { log: main.ILog; ipc: main.DbIpcClient }) {
  const dir = `.db/main`;
  const res = await main.init({ dir });

  // const db = (this.db = res.db);
  // const swarm = (this.swarm = res.swarm);

  console.group('🌳  HyperDB');
  console.log('- dbKey:', res.dbKey);
  console.log('- localKey:', res.localKey);
  console.groupEnd();
}
