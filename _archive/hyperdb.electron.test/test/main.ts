import { fs } from '@platform/fs';
import hyperdb from '@platform/hyperdb.electron/lib/main';
import uiharness from '@uiharness/electron/lib/main';
import { app } from 'electron';
import { filter } from 'rxjs/operators';

import * as t from './types';

const config = require('../.uiharness/config.json') as uiharness.IRuntimeConfig;

app.on('ready', async () => {
  const context = await uiharness.init({ config });
  const { log, ipc } = context;
  const store = context.store as t.ITestStore;

  log.info('main started');

  try {
    /**
     * Initialize the settings store.
     */
    const dir = uiharness.is.prod ? fs.join(app.getPath('userData'), 'db') : fs.resolve('.dev/db');
    log.info(log.gray('databases:'), dir);
    await store.set('dir', dir);
    await updateDatabaseList(store);

    /**
     * Initialise the HyperDB on the [main] process.
     */
    const { events$ } = await hyperdb.listen({ ipc, log });
    const created$ = events$.pipe(filter(e => e.type === 'DB/main/created'));

    // Keep the store object in-sync when a new DB is created.
    created$.subscribe(e => updateDatabaseList(store));
  } catch (error) {
    log.error('failed during startup', error);
  }
});

/**
 * [Internal]
 */
export async function updateDatabaseList(store: t.ITestStore) {
  const dir = await store.get('dir');
  const exclude = ['.DS_Store'];

  await fs.ensureDir(dir);
  const files = (await fs.readdir(dir)).filter(name => !exclude.includes(name));
  await store.set('databases', files);
}
