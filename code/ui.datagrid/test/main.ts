import * as uiharness from '@uiharness/electron/lib/main';
const config = require('../.uiharness/config.json');

/**
 * Main entry point.
 */
(async () => {
  await uiharness.init({ config });
})();
