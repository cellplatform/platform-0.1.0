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
      const { timeout: msecs = 3000 } = options;
      const tx = slug();

      const first = firstValueFrom(
        info.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`[SysFsInfo] request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'sys.fs/info:req',
        payload: { tx, id },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, id, error: res } : res;
    },
  };

  return { id, $, is, dispose, dispose$, info };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('sys.fs/'),
};
