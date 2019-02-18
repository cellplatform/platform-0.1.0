import { interval } from 'rxjs';

import main from '@platform/electron/lib/main';
import { time } from '@platform/util.value';
import * as uiharness from '@uiharness/electron/lib/main';
import { BrowserWindow } from 'electron';
import { map } from 'rxjs/operators';

import * as t from '../src/types';

const config = require('../.uiharness/config.json') as uiharness.IUIHarnessRuntimeConfig;

/**
 * Initialize the default [main] window process with the [UIHarness].
 */
(async () => {
  // const store = main.store.create();
  const appName = config.name;

  // NOTE:  You could also get [log, ipc] from `uiharness.init`.
  //        Calling these here as this is about testing the module
  //        that contains [log] and [ipc].
  const { log, ipc, store, windows } = await main.init<t.MyEvents>({ appName });

  const { newWindow } = await uiharness.init({
    config,
    log,
    ipc,
    // devTools: true,
    windows,
  });

  log.info.blue('started');
  // log.info('store.count', log.cyan(store.get('count') || 0));

  // TEMP 🐷
  // interval(1000).subscribe(() => {
  //   windows.refresh();
  // });

  /**
   * Filter (new window).
   */
  ipc.on('NEW_WINDOW').subscribe(e => {
    const all = BrowserWindow.getAllWindows();
    if (e.type === 'NEW_WINDOW') {
      const name = `New Window (${all.length})`;
      newWindow({ name, devTools: true });
    }
  });

  /**
   * Subscribe to all events.
   */
  ipc
    .filter(e => e.type !== '@platform/LOG/write')
    .subscribe(e => {
      const { targets, sender } = e;
      const type = log.yellow(e.type);
      log.info('🐷  IPC', type, { sender: sender.id }, { targets });
    });

  /**
   * Send a delayed IPC message from main to all windows.
   */
  time.delay(3000, () => {
    const msg = { text: '🌳 delayed message from main to window-1' };
    ipc.send<t.IMessageEvent>('MESSAGE', msg, { target: 1 });
  });

  /**
   * Provide a response-handler for a specific event.
   */
  ipc.handle<t.IFooEvent>('FOO', async e => {
    // await time.wait(1000);
    return `response FOO (MAIN) 🤖`;
  });

  /**
   * Dev tools.
   */
  ipc
    .on<t.ICreateDevToolsEvent>('DEVTOOLS/create')
    .pipe(map(e => e.payload))
    .subscribe(e => {
      const id = e.windowId;
      const all = BrowserWindow.getAllWindows();
      const parent = all.find(window => window.id === id);
      main.devTools.create({ parent, windows });
    });
})();
