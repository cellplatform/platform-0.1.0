import uiharness from '@uiharness/electron/lib/main';
const config = require('../.uiharness/config.json') as uiharness.IRuntimeConfig;

(async () => {
  const { log } = await uiharness.init({ config });
  log.info('main started');
})();
