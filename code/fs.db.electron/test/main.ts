import uiharness from '@uiharness/electron/lib/main';
const config = require('../.uiharness/config.json') as uiharness.IRuntimeConfig;

import main from '../src/main';

(async () => {
  const { log, ipc } = await uiharness.init({ config });

  const res = main.listen({ log, ipc });
  const { events$, factory } = res;

  events$.subscribe(e => {
    // log.info(e);
  });

  /**
   * Example of working with a DB directly on `main`.
   */
  const db = await factory('nedb:tmp/main.db');
  await db.put('foo', 111);
  const foo = await db.get('foo');
  log.info('foo:', foo.value);

  // Finish up.
  log.info('main started');
})();
