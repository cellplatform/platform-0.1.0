import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';

import { BusEventsIndexer } from './BusEvents.Indexer';
import { BusEventsIo } from './BusEvents.Io';
import { BusEventsCell } from './BusEvents.Cell';
import { rx, slug, t, timeoutWrangler } from './common';

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

  /**
   * Initialize sub-event API's
   */
  const { io, index, cell } = (() => {
    const timeout = toTimeout();
    const io = BusEventsIo({ id, $, bus, timeout });
    const index = BusEventsIndexer({ id, $, bus, timeout });
    const cell = BusEventsCell({ id, $, bus, timeout });
    return { io, index, cell };
  })();

  /**
   * Info
   */
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
      if (typeof res !== 'string') return res;

      const error: t.SysFsError = { code: 'client/timeout', message: res };
      const fail: t.SysFsInfoRes = { tx, id, files: [], error };
      return fail;
    },
  };

  /**
   * API
   */
  return { id, $, is, dispose, dispose$, info, io, index, cell };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('sys.fs/'),
};
