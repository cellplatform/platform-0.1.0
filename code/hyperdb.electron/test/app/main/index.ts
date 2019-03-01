import * as uiharness from '@uiharness/electron/lib/main';
import { filter } from 'rxjs/operators';

import main from '../../../src/main';
import * as t from '../types';

const config = require('../../../.uiharness/config.json') as uiharness.IUihRuntimeConfig;

(async () => {
  const context = await uiharness.init({ config });
  const { log, ipc } = context;
  const store = context.store as t.ITestStore;

  log.info('main started');

  try {
    /**
     * TODO
     * - store the initial DB key in the store.
     */

    /**
     * Initialise the HyperDB on the [main] process.
     */
    const { events$ } = await main.listen({ ipc, log });

    // Store the [dbKey] for the primary database
    // so that other demo-windows can connect with it.
    events$
      .pipe(
        filter(e => e.type === 'DB/main/created'),
        filter(e => e.payload.dir.endsWith('/tmp-1')),
      )
      .subscribe(async e => {
        await store.set('dbKey', e.payload.dbKey);
      });
  } catch (error) {
    /**
     * Failed at startup.
     */
    log.error(error.message);
  }
})();
