import hyperdb from '@platform/hyperdb.electron/lib/main';
import uiharness from '@uiharness/electron/lib/main';

const config = require('../.uiharness/config.json') as uiharness.IRuntimeConfig;

(async () => {
  const { log, ipc } = await uiharness.init({ config });
  log.info('main started');

  /**
   * Initialise the HyperDB on the [main] process.
   */
  const { events$ } = await hyperdb.listen({ ipc, log });
})();
