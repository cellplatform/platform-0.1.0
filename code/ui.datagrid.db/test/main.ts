import { fs } from '@platform/fs';
// import hyperdb from '@platform/hyperdb.electron/lib/main';
import dbMain from '@platform/fs.db.electron/lib/main';

import uiharness from '@uiharness/electron/lib/main';
import { app } from 'electron';
import { filter } from 'rxjs/operators';

const config = require('../.uiharness/config.json') as uiharness.IRuntimeConfig;

(async () => {
  const { log, ipc } = await uiharness.init({ config });
  log.info('main started');

  /**
   * Initialise the HyperDB on the [main] process.
   */
  // const { creating$ } = await hyperdb.listen({ ipc, log });
  await dbMain.listen({ ipc, log });

  // creating$
  //   // Change the DB directory when running in production.
  //   .pipe(filter(e => Boolean(uiharness.is.prod)))
  //   .subscribe(e => {
  //     e.dir = fs.join(app.getPath('appData'), 'db');
  //   });
})();
