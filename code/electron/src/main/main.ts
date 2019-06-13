import { fs } from '@platform/fs';
import { app } from 'electron';

import * as devTools from '../helpers/devTools/main';
import { init as initIpc, IpcClient, IpcMessage, MAIN_ID } from '../helpers/ipc/main';
import * as logger from '../helpers/logger/main';
import { init as initStore } from '../helpers/store/main';
import { WindowsMain } from '../helpers/windows/main';
import * as t from '../types';

export * from '../types';
export * from '../helpers/screen/main';
export { is } from '../helpers/is/main';
export { devTools, logger };

/**
 * Initializes [Main] process systems (safely).
 */
export async function init<M extends IpcMessage = any, S extends t.StoreJson = any>(
  args: {
    appName?: string;
    ipc?: t.IpcClient<M>;
    log?: t.IMainLog | string;
    store?: t.IMainStoreClient<S>;
    windows?: t.IWindows;
  } = {},
): Promise<t.IMain<M, S>> {
  await ready();
  const { appName } = args;
  const id = MAIN_ID;

  // Initiaize modules.
  const ipc = args.ipc || initIpc<M>();
  const store = args.store || initStore<S>({ ipc });
  const windows = args.windows || createWindows({ ipc });
  const log =
    typeof args.log === 'object'
      ? args.log // Logger already exists and was provided.
      : initLog({ ipc, dir: args.log, appName }); // Initialize a new log.
  devTools.listen({ ipc, windows });

  // Finish up.
  const main: t.IMain<M, S> = { id, ipc, log, store, windows };
  return main;
}

/**
 * Factory for creating `windows` manager.
 */
export function createWindows(args: { ipc: t.IpcClient }) {
  const { ipc } = args;
  return new WindowsMain({ ipc });
}

/**
 * Promise that waits until the app is ready or returns immediately if already `ready`.
 */
export function ready() {
  return new Promise((resolve, reject) => {
    if (app.isReady()) {
      resolve();
    } else {
      app.on('ready', () => resolve());
    }
  });
}

/**
 * [Internal]
 */
function initLog(args: { ipc: IpcClient; dir?: string; appName?: string }) {
  const { ipc } = args;
  let appName = args.appName || app.getName();
  appName = appName.replace(/\s/g, '-').toLowerCase();
  const dir = args.dir || fs.join(fs.dirname(app.getPath('logs')), appName);
  return logger.init({ ipc, dir });
}
