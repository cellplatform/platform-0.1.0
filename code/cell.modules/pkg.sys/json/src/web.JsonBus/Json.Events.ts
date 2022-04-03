import { filter, takeUntil } from 'rxjs/operators';
import { rx, slug, t } from './common';

type Id = string;

/**
 * Event API for the "WebRuntime"
 */
export function JsonEvents(args: {
  instance: t.JsonBusInstance;
  id?: Id;
  filter?: (e: t.JsonEvent) => boolean;
}): t.JsonEvents {
  const { dispose, dispose$ } = rx.disposable();

  const bus = rx.busAsType<t.JsonEvent>(args.instance.bus);
  const instance = args.instance.id;
  const is = JsonEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.instance(e, instance)),
    filter((e) => args.filter?.(e) ?? true),
  );

  /**
   * Base information about the module.
   */
  const info: t.JsonEvents['info'] = {
    req$: rx.payload<t.JsonInfoReqEvent>($, 'sys.json/info:req'),
    res$: rx.payload<t.JsonInfoResEvent>($, 'sys.json/info:res'),
    async get(options = {}) {
      const { timeout = 3000 } = options;
      const tx = slug();

      const op = 'info';
      const res$ = info.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.JsonInfoResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.json/info:req',
        payload: { tx, instance },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, instance, error };
    },
  };

  /**
   * API
   */
  return {
    instance: { bus: rx.bus.instance(bus), id: instance },
    $,
    dispose,
    dispose$,
    is,
    info,
  };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
JsonEvents.is = {
  base: matcher('sys.json/'),
  instance: (e: t.Event, instance: Id) => JsonEvents.is.base(e) && e.payload?.instance === instance,
};
