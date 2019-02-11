import { fs } from '@platform/fs';
import { app } from 'electron';

import * as devTools from '../helpers/devTools/main';
import { init as initIpc, IpcClient, IpcMessage } from '../helpers/ipc/main';
import * as logger from '../helpers/logger/main';
import { IMainLog } from '../types';

// import * as store from '../helpers/store';
export * from '../types';

export { devTools, logger };

export type IMainInitResponse<M extends IpcMessage> = {
  ipc: IpcClient<M>;
  log: IMainLog;
};

/**
 * Initializes [Main] process systems (safely).
 */
export function init<M extends IpcMessage>(
  args: { ipc?: IpcClient<M>; log?: IMainLog | string; appName?: string } = {},
): IMainInitResponse<M> {
  const ipc = args.ipc || initIpc<M>();

  /**
   * Logging.
   */
  const initLog = (dir?: string) => {
    let appName = args.appName || app.getName();
    appName = appName.replace(/\s/g, '-').toLowerCase();
    dir = dir || fs.join(fs.dirname(app.getPath('logs')), appName);
    return logger.init({ ipc, dir });
  };
  const log =
    typeof args.log === 'object'
      ? args.log // Logger already exists and was provided.
      : initLog(args.log); // Initialize a new log.

  // Finish up.
  return { ipc, log };
}
