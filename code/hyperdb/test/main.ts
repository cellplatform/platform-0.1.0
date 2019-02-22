import main from '../src/main';
import * as uiharness from '@uiharness/electron/lib/main';
const config = require('../.uiharness/config.json');

(async () => {
  const context = await uiharness.init({ config });
  const { log, ipc } = context;
  await main.init({ ipc, log });
})();
