import { Menu, MenuItem, app, BrowserWindow } from 'electron';
import db from '@platform/fs.db.electron/lib/main';
import uiharness from '@uiharness/electron/lib/main';

const config = require('../.uiharness/config.json') as uiharness.IRuntimeConfig;

(async () => {
  const { log, ipc } = await uiharness.init({ config });
  log.info('main started');

  /**
   * Initialise the HyperDB on the [main] process.
   */
  // const { creating$ } = await hyperdb.listen({ ipc, log });
  await db.listen({ ipc, log });

  // creating$
  //   // Change the DB directory when running in production.
  //   .pipe(filter(e => Boolean(uiharness.is.prod)))
  //   .subscribe(e => {
  //     e.dir = fs.join(app.getPath('appData'), 'db');
  //   });
})();
