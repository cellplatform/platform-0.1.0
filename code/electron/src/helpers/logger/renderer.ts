import { create } from '@platform/log/lib/client';
import { filter, map } from 'rxjs/operators';

import { IpcClient } from '../ipc/Client';
import * as t from './types';

export { ILog } from './types';

type Ref = { log?: t.ILog };
const ref: Ref = {};

/**
 * Configure local logging on the [renderer] process.
 */
export function init(args: { ipc: IpcClient }) {
  if (ref.log) {
    return ref.log;
  }
  const ipc = args.ipc as IpcClient<t.LoggerEvents>;

  // Fire events through IPC to the main process.
  const log = create();
  log.events$
    .pipe(
      filter(() => !log.silent),
      filter(e => e.type === 'LOG'),
      map(e => e.payload as t.ILogEvent),
    )
    .subscribe(e => ipc.send('@platform/LOG/write', e, { target: ipc.MAIN }));

  // Finish up.
  ref.log = log;
  return log;
}
