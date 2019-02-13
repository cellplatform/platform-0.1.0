import { log } from '@platform/log/lib/client';
import { filter, map } from 'rxjs/operators';

import { IpcClient } from '../ipc/Client';
import * as t from './types';

export { ILog } from './types';
export { log };

let isInitialized = false;

/**
 * Configure local logging on the [renderer] process.
 */
export function init(args: { ipc: IpcClient }) {
  if (isInitialized) {
    return log;
  }
  isInitialized = true;
  const ipc = args.ipc as IpcClient<t.LoggerEvents>;

  // Fire events through IPC to the main process.
  log.events$
    .pipe(
      filter(() => !log.silent),
      filter(e => e.type === 'LOG'),
      map(e => e.payload as t.ILogEvent),
    )
    .subscribe(e => ipc.send('@platform/LOG/write', e, { target: ipc.MAIN }));

  return log;
}
