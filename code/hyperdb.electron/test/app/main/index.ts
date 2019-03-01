import { app } from 'electron';
import * as uiharness from '@uiharness/electron/lib/main';
import { filter } from 'rxjs/operators';
import { is, fs } from './common';

import main from '../../../src/main';
import * as t from '../types';

const config = require('../../../.uiharness/config.json') as uiharness.IUihRuntimeConfig;

(async () => {
  const context = await uiharness.init({ config });
  const { log, ipc } = context;
  const store = context.store as t.ITestStore;

  log.info('main started || ');
  log.info('\n\nstore.path >>>> ', store && (store as any).path, '\n\n');

  try {
    /**
     * Initialize the settings store.
     */
    const dir = is.prod ? fs.join(app.getPath('userData'), 'db') : fs.resolve('.dev/db');
    log.info(log.gray('databases:'), dir);
    await store.set('dir', dir);

    const d = await store.get('dir');
    log.info(d);

    const v = await store.read();
    log.info(v);

    await updateDatabaseList(store);

    log.info('AFTER UPDATE');

    /**
     * Initialise the HyperDB on the [main] process.
     */
    const { events$ } = await main.listen({ ipc, log });
    const created$ = events$.pipe(filter(e => e.type === 'DB/main/created'));

    // Keep the store object in sync when a new DB is created.
    created$.subscribe(e => updateDatabaseList(store));

    // Store the [dbKey] for the primary database
    // so that other demo-windows can connect with it.
    created$.pipe(filter(e => e.payload.dir.endsWith('/tmp-1'))).subscribe(async e => {
      await store.set('dbKey', e.payload.dbKey);
      // await updateDatabaseList(store);
    });
  } catch (error) {
    log.error('failed during startup', error);
  }
})();

/**
 * INTERNAL
 */
export async function updateDatabaseList(store: t.ITestStore) {
  const dir = await store.get('dir');

  await fs.ensureDir(dir);
  const files = await fs.readdir(dir);
  await store.set('databases', files);
}
