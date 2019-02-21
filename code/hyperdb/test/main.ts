import main from '../src/main';
import * as uiharness from '@uiharness/electron/lib/main';
const config = require('../.uiharness/config.json');

(async () => {
  await uiharness.init({ config });

  // const res = await main.db.init({ db: 'db1' });
})();
