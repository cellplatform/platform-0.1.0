import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

import { rx, slug, t, timeoutWrangler } from './common';

type FilesystemId = string;

/**
 * Events for working with remote cells.
 */
export function BusEventsCell(args: {
  id: FilesystemId;
  $: t.Observable<t.SysFsEvent>;
  bus: t.EventBus<t.SysFsEvent>;
  timeout: number;
}): t.SysFsEventsCell {
  const { id, $, bus } = args;
  const toTimeout = timeoutWrangler(args.timeout);

  const push: t.SysFsEventsCell['push'] = {
    req$: rx.payload<t.SysFsCellPushReqEvent>($, 'sys.fs/cell/push:req'),
    res$: rx.payload<t.SysFsCellPushResEvent>($, 'sys.fs/cell/push:res'),
  };

  const pull: t.SysFsEventsCell['pull'] = {
    req$: rx.payload<t.SysFsCellPullReqEvent>($, 'sys.fs/cell/pull:req'),
    res$: rx.payload<t.SysFsCellPullResEvent>($, 'sys.fs/cell/pull:res'),
  };

  return { push, pull };
}
