import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t, timeoutWrangler } from './common';
import { BusEventsIo } from './BusEvents.Io';
import { BusEventsIndexer } from './BusEvents.Indexer';

type FilesystemId = string;
type Milliseconds = number;

/**
 * Event API.
 */
export function BusEvents(args: {
  id: FilesystemId;
  bus: t.EventBus<any>;
  filter?: (e: t.SysFsEvent) => boolean;
  timeout?: Milliseconds; // Default timeout
}): t.SysFsEvents {
  const { id } = args;
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.SysFsEvent>(args.bus);
  const is = BusEvents.is;

  const toTimeout = timeoutWrangler(args.timeout);

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
    filter((e) => args.filter?.(e) ?? true),
    filter((e) => e.payload.id === id),
  );

  const io = BusEventsIo({ id, $, bus, timeout: toTimeout() });
  const index = BusEventsIndexer({ id, $, bus, timeout: toTimeout() });

  const info: t.SysFsEvents['info'] = {
    req$: rx.payload<t.SysFsInfoReqEvent>($, 'sys.fs/info:req'),
    res$: rx.payload<t.SysFsInfoResEvent>($, 'sys.fs/info:res'),
    async get(options = {}) {
      const { path } = options;
      const msecs = toTimeout(options);
      const tx = slug();

      const first = firstValueFrom(
        info.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Info] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'sys.fs/info:req',
        payload: { tx, id, path },
      });

      const res = await first;
      return typeof res === 'string'
        ? { tx, id, files: [], error: { code: 'client/timeout', message: res } }
        : res;
    },
  };

  return { id, $, is, dispose, dispose$, info, io, index };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('sys.fs/'),
};
