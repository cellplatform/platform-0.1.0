import * as main from '@uiharness/electron/lib/main';
const config = require('../.uiharness/config.json') as main.IRuntimeConfig;

(async () => {
  const { log } = await main.init({ config });
  log.info('main started');
})();
