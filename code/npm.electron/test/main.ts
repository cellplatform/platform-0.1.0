import * as main from '@uiharness/electron/lib/main';
import { init } from '../src/main';

const config = require('../.uiharness/config.json') as main.IRuntimeConfig;

(async () => {
  const { log, ipc } = await main.init({ config });
  init({ log, ipc });
  log.info('main started');
})();
