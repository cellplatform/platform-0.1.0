import { EventBus } from '@platform/types';
import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from './common';

type FilesystemId = string;

/**
 * Event API.
 */
export function BusEvents(args: {
  id: FilesystemId;
  bus: EventBus<any>;
  filter?: (e: t.SysFsEvent) => boolean;
}): t.SysFsEvents {
  const { id } = args;
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.SysFsEvent>(args.bus);
  const is = BusEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
    filter((e) => args.filter?.(e) ?? true),
    filter((e) => e.payload.id === id),
  );

  /**
   * Base information about the vendor module.
   */
  const info: t.SysFsEvents['info'] = {
    req$: rx.payload<t.SysFsInfoReqEvent>($, 'sys.fs/info:req'),
    res$: rx.payload<t.SysFsInfoResEvent>($, 'sys.fs/info:res'),
    async get(options = {}) {
      const { timeout: msecs = 3000, path } = options;
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

  type IO = t.SysFsEvents['io'];
  const read: IO['read'] = {
    req$: rx.payload<t.SysFsReadReqEvent>($, 'sys.fs/read:req'),
    res$: rx.payload<t.SysFsReadResEvent>($, 'sys.fs/read:res'),
    async get(path, options = {}) {
      const { timeout: msecs = 3000 } = options;
      const tx = slug();

      const first = firstValueFrom(
        read.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Read] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({ type: 'sys.fs/read:req', payload: { tx, id, path } });
      const res = await first;

      if (typeof res === 'string')
        return { tx, id, files: [], error: { code: 'client/timeout', message: res } };

      const { files, error } = res;
      return { files, error };
    },
  };

  const write: IO['write'] = {
    req$: rx.payload<t.SysFsWriteReqEvent>($, 'sys.fs/write:req'),
    res$: rx.payload<t.SysFsWriteResEvent>($, 'sys.fs/write:res'),
    async fire(file, options = {}) {
      const { timeout: msecs = 3000 } = options;
      const tx = slug();

      const first = firstValueFrom(
        write.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFs.Write] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({ type: 'sys.fs/write:req', payload: { tx, id, file } });
      const res = await first;

      if (typeof res === 'string')
        return { tx, id, files: [], error: { code: 'client/timeout', message: res } };

      const { files, error } = res;
      return { files, error };
    },
  };

  const io: IO = { read, write };

  return { id, $, is, dispose, dispose$, info, io };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('sys.fs/'),
};
