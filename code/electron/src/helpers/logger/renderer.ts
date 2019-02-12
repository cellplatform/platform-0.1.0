import { filter, map } from 'rxjs/operators';
import { log } from '@platform/log/lib/client';

export { log };
import { IpcClient } from '../ipc/Client';
import { LoggerEvents, ILogEvent } from './types';

let isInitialized = false;

/**
 * Configure local logging on the [renderer] process.
 */
export function init(args: { ipc: IpcClient }) {
  if (isInitialized) {
    return log;
  }
  isInitialized = true;
  const ipc = args.ipc as IpcClient<LoggerEvents>;

  // Fire events through IPC to the main process.
  log.events$
    .pipe(
      filter(() => !log.silent),
      filter(e => e.type === 'LOG'),
      map(e => e.payload as ILogEvent),
    )
    .subscribe(e => ipc.send('@platform/LOG/write', e, { target: ipc.MAIN }));

  return log;
}
