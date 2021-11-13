import { firstValueFrom, of, timeout } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { t, rx, DEFAULT, slug } from './common';

type InstanceId = string;

/**
 * Event API for the "WebRuntime"
 */
export function BusEvents(args: {
  bus: t.EventBus<any>;
  id?: InstanceId;
  filter?: (e: t.MyEvent) => boolean;
}): t.WebRuntimeEvents {
  const { dispose, dispose$ } = rx.disposable();
  const id = args.id ?? DEFAULT.id;
  const bus = rx.busAsType<t.MyEvent>(args.bus);
  const is = BusEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.instance(e, id)),
    filter((e) => args.filter?.(e) ?? true),
  );

  /**
   * Base information about the module.
   */
  const info: t.WebRuntimeEvents['info'] = {
    req$: rx.payload<t.MyInfoReqEvent>($, 'my.namespace/info:req'),
    res$: rx.payload<t.MyInfoResEvent>($, 'my.namespace/info:res'),
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
        type: 'my.namespace/info:req',
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
  base: matcher('my.namespace/'),
  instance: (e: t.Event, id: InstanceId) => BusEvents.is.base(e) && e.payload?.id === id,
};
