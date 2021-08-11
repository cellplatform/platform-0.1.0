import { EventBus } from '@platform/types';
import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t } from './common';

/**
 * Event API.
 */
export function BusEvents(args: { bus: EventBus<any> }): t.VercelEvents {
  const { dispose, dispose$ } = rx.disposable();
  const bus = rx.busAsType<t.VercelEvent>(args.bus);
  const is = BusEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.base(e)),
  );

  /**
   * Base information about the vendor module.
   */
  const moduleInfo: t.VercelEvents['moduleInfo'] = {
    req$: rx.payload<t.VercelModuleInfoReqEvent>($, 'vendor.vercel/info:req'),
    res$: rx.payload<t.VercelModuleInfoResEvent>($, 'vendor.vercel/info:res'),
    async get(options = {}) {
      const { timeout: msecs = 3000 } = options;
      const tx = slug();

      const first = firstValueFrom(
        moduleInfo.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`Timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'vendor.vercel/info:req',
        payload: { tx },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, error: res } : res;
    },
  };

  return { $, is, dispose, dispose$, moduleInfo };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('vendor.vercel/'),
};
