import * as devTools from '../helpers/devTools/main';
import { init as initIpc, IpcClient, IpcMessage } from '../helpers/ipc/main';
import * as logger from '../helpers/logger/main';
// import * as store from '../helpers/store';
import { ILog } from '../types';

export { devTools, logger };

/**
 * Initializes [Main] process systems (safely).
 */
export function init<M extends IpcMessage>(
  args: { ipc?: IpcClient<M>; log?: ILog | string } = {},
) {
  const ipc = args.ipc || initIpc<M>();

  const log =
    typeof args.log === 'object'
      ? args.log // Logger already exists.
      : logger.init({ ipc, dir: args.log }); // Initialize a new log.

  return { ipc, log };
}
