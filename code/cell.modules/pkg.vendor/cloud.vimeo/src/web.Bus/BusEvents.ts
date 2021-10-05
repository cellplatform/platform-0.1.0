import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { t, rx, DEFAULT, slug } from './common';

type InstanceId = string;

/**
 * Event API for "Vimeo".
 */
export function BusEvents(args: {
  bus: t.EventBus<any>;
  id?: InstanceId;
  filter?: (e: t.VimeoEvent) => boolean;
}): t.VimeoEvents {
  const { dispose, dispose$ } = rx.disposable();
  const id = args.id ?? DEFAULT.id;
  const bus = rx.busAsType<t.VimeoEvent>(args.bus);
  const is = BusEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.instance(e, id)),
    filter((e) => args.filter?.(e) ?? true),
  );

  /**
   * Base information about the vendor module.
   */
  const info: t.VimeoEvents['info'] = {
    req$: rx.payload<t.VimeoInfoReqEvent>($, 'vendor.vimeo/info:req'),
    res$: rx.payload<t.VimeoInfoResEvent>($, 'vendor.vimeo/info:res'),
    async get(options = {}) {
      const { timeout: msecs = 90000 } = options;
      const tx = slug();

      const first = firstValueFrom(
        info.res$.pipe(
          filter((e) => e.tx === tx),
          timeout(msecs),
          catchError(() => of(`ModuleInfo request timed out after ${msecs} msecs`)),
        ),
      );

      bus.fire({
        type: 'vendor.vimeo/info:req',
        payload: { tx, id },
      });

      const res = await first;
      return typeof res === 'string' ? { tx, id, error: res } : res;
    },
  };

  return { $, id, is, dispose, dispose$, info };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
BusEvents.is = {
  base: matcher('vendor.vimeo/'),
  instance: (e: t.Event, id: InstanceId) => BusEvents.is.base(e) && e.payload?.id === id,
};
