import main from '@platform/electron/lib/main';
import { time } from '@platform/util.value';
import * as uiharness from '@uiharness/electron/lib/main';
import * as root from 'app-root-path';
import { BrowserWindow } from 'electron';
import { format } from 'url';

import * as t from '../src/types';

const config = require('../.uiharness/config.json') as uiharness.IRuntimeConfig;

/**
 * Initialize the default [main] window process with the [UIHarness].
 */
(async () => {
  // const store = main.store.create();
  const appName = config.name;

  // NOTE:  You could also get [log, ipc] from `uiharness.init`.
  //        Calling these here as this is about testing the module
  //        that contains [log] and [ipc].
  const { log, ipc, settings, windows } = await main.init<t.MyEvents>({ appName });
  const factory = new main.ScreenFactory<t.MyEvents>({ log, settings, ipc, windows });

  console.log('start // test');

  const defaultFactory = factory.type({
    type: 'default',
    url: fromKey('default'),
    window: {
      title: 'Debug',
      width: 1200,
      height: 600,
    },
  });

  try {
    defaultFactory.create({ uid: 'foo' });
    log.info.blue('started');

    // defaultFactory.change$.subscribe(e => {
    //   console.log('defaultFactory.change$', e.type);
    // });

    /**
     * Filter (new window).
     */
    ipc.on('TEST/window/new').subscribe(async e => {
      const all = BrowserWindow.getAllWindows();
      if (e.type === 'TEST/window/new') {
        const title = `New Window (${all.length})`;

        const focused = windows.focused;
        const current = BrowserWindow.fromId(focused ? focused.id : -1);
        const bounds = current ? { ...current.getBounds() } : undefined;
        const x = bounds ? bounds.x + 40 : undefined;
        const y = bounds ? bounds.y + 40 : undefined;

        const screen = defaultFactory.create({
          uid: 'foo-1',
          window: { title },
          bounds: { x, y }, // Override default window and state values.
        });
      }
    });

    /**
     * Refresh windows from MAIN.
     */
    ipc.on('TEST/windows/refresh').subscribe(e => {
      windows.refresh();
    });

    /**
     * Log the windows state on MAIN.
     */
    ipc.on('TEST/windows/write/main').subscribe(e => {
      const state = windows.toObject();
      log.info();
      log.info(`windows:`);
      log.info('focused:', state.focused ? state.focused.id : undefined);
      state.refs.forEach(e => {
        log.info(`- id:`, e.id);
        log.info(`- children:`, e.children);
        log.info(`- tags:`, e.tags.length);
        e.tags.forEach(tag => log.info(`  -`, tag));
        log.info();
      });
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
      ipc.send<t.ITestMessageEvent>('TEST/message', msg, { target: 1 });
    });

    /**
     * Provide a response-handler for a specific event.
     */
    ipc.handle<t.IFooEvent>('FOO', async e => {
      // await time.wait(1000);
      return `response FOO (MAIN) 🤖`;
    });
  } catch (error) {
    log.error(error.message);
  }
})();

/**
 * [Helpers]
 */

export function fromKey(key: string) {
  const item = config.electron.renderer[key];
  if (!item) {
    throw new Error(`Renderer entry point not found for '${key}' in configuration JSON.`);
  }
  const { path } = item;
  if (main.is.prod) {
    return format({
      protocol: 'file:',
      pathname: root.resolve(path),
      slashes: true,
    });
  } else {
    const filename = path.substr(path.lastIndexOf('/') + 1);
    const port = config.electron.port;
    return `http://localhost:${port}/${filename}`;
  }
}
