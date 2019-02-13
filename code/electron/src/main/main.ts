import { fs } from '@platform/fs';
import { app } from 'electron';

import * as devTools from '../helpers/devTools/main';
import { init as initIpc, IpcClient, IpcMessage } from '../helpers/ipc/main';
import * as logger from '../helpers/logger/main';
import { init as initStore } from '../helpers/store/main';
import * as t from '../types';

export * from '../types';

export { devTools, logger };

export type IInitMainResponse<M extends t.IpcMessage, S extends t.StoreJson> = {
  ipc: t.IpcClient<M>;
  log: t.IMainLog;
  store: t.IMainStoreClient<S>;
};

/**
 * Initializes [Main] process systems (safely).
 */
export function init<M extends IpcMessage = any, S extends t.StoreJson = any>(
  args: {
    appName?: string;
    ipc?: t.IpcClient<M>;
    log?: t.IMainLog | string;
    store?: t.IMainStoreClient<S>;
  } = {},
): IInitMainResponse<M, S> {
  const { appName } = args;

  // Initiaize modules.
  const ipc = args.ipc || initIpc<M>();
  const store = args.store || initStore<S>({ ipc });
  const log =
    typeof args.log === 'object'
      ? args.log // Logger already exists and was provided.
      : initLog({ ipc, dir: args.log, appName }); // Initialize a new log.

  // Finish up.
  return { ipc, log, store };
}

/**
 * INTERNAL
 */
function initLog(args: { ipc: IpcClient; dir?: string; appName?: string }) {
  const { ipc } = args;
  let appName = args.appName || app.getName();
  appName = appName.replace(/\s/g, '-').toLowerCase();
  const dir = args.dir || fs.join(fs.dirname(app.getPath('logs')), appName);
  return logger.init({ ipc, dir });
}
