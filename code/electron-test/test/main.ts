import main from '@tdb/electron/lib/main';
import { time } from '@tdb/util';
import * as uiharness from '@uiharness/electron/lib/main';
import { BrowserWindow } from 'electron';
import { map } from 'rxjs/operators';

import * as types from '../src/types';

const config = require('../.uiharness/config.json');

/**
 * Initialize the default [main] window process with the [UIHarness].
 */
(async () => {
  const store = main.store.create();

  // NOTE:  You could also get [log, ipc] from `uiharness.init`.
  //        Calling these here as this is about testing the module
  //        that contains [log] and [ipc].
  const { log, ipc } = main.init<types.MyEvents>();

  const { newWindow } = await uiharness.init({
    config,
    log,
    ipc,
    // devTools: false,
  });

  log.info.blue('started');
  log.info('store.count', log.cyan(store.get('count') || 0));

  /**
   * Filter (new window).
   */
  ipc.on('NEW_WINDOW').subscribe(e => {
    const all = BrowserWindow.getAllWindows();
    if (e.type === 'NEW_WINDOW') {
      const name = `New Window (${all.length})`;
      newWindow({ name });
    }
  });

  /**
   * Subscribe to all events.
   */
  ipc
    .filter(e => e.type !== 'LOG/write')
    .subscribe(e => {
      const { targets, sender } = e;
      const type = log.yellow(e.type);
      log.info('🐷  IPC', type, { sender: sender.id }, { targets });
    });

  /**
   * Send a delayed IPC message from main to all windows.
   */
  time.delay(3000, () => {
    const msg = { text: '🌳 delayed message from main' };
    ipc.send<types.IMessageEvent>('MESSAGE', msg, 1);
  });

  /**
   * Provide a response-handler for a specific event.
   */
  ipc.handle<types.IFooEvent>('FOO', async e => {
    // await time.wait(1000);
    return `response FOO (MAIN) 🤖`;
  });

  /**
   * Dev tools.
   */
  ipc
    .on<types.ICreateDevToolsEvent>('DEVTOOLS/create')
    .pipe(map(e => e.payload))
    .subscribe(e => {
      const all = BrowserWindow.getAllWindows();
      const parent = all.find(window => window.id === e.windowId);
      main.devTools.create({ parent, ipc, log });
    });
})();
