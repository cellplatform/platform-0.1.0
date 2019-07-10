import uiharness from '@uiharness/electron/lib/main';
const config = require('../.uiharness/config.json') as uiharness.IRuntimeConfig;

import main from '../src/main';

(async () => {
  const { log, ipc } = await uiharness.init({ config });
  main.listen({ log, ipc });
  log.info('main started');
})();
