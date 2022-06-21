import { filter, takeUntil } from 'rxjs/operators';
import { rx, slug, t, DEFAULT } from './common';

type Id = string;

/**
 * Event API for the UI router.
 */
export function RouteEvents(args: {
  instance: t.RouteInstance;
  filter?: (e: t.RouteEvent) => boolean;
  dispose$?: t.Observable<any>;
}): t.RouteEvents {
  const { dispose, dispose$ } = rx.disposable(args.dispose$);

  const bus = rx.busAsType<t.RouteEvent>(args.instance.bus);
  const instance = args.instance.id ?? DEFAULT.INSTANCE;
  const is = RouteEvents.is;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.instance(e, instance)),
    filter((e) => args.filter?.(e) ?? true),
  );

  /**
   * Base information about the route.
   */
  const info: t.RouteEvents['info'] = {
    req$: rx.payload<t.RouteInfoReqEvent>($, 'sys.ui.route/info:req'),
    res$: rx.payload<t.RouteInfoResEvent>($, 'sys.ui.route/info:res'),
    async get(options = {}) {
      const { timeout = 3000 } = options;
      const tx = slug();

      const op = 'info';
      const res$ = info.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.RouteInfoResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.ui.route/info:req',
        payload: { tx, instance },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, instance, error };
    },
  };

  /**
   * Change operations on the route.
   */
  const change: t.RouteEvents['change'] = {
    req$: rx.payload<t.RouteChangeReqEvent>($, 'sys.ui.route/change:req'),
    res$: rx.payload<t.RouteChangeResEvent>($, 'sys.ui.route/change:res'),
    async fire(options = {}) {
      const { path, hash, query, timeout = 3000 } = options;
      const tx = slug();

      const op = 'change';
      const res$ = change.res$.pipe(filter((e) => e.tx === tx));
      const first = rx.asPromise.first<t.RouteChangeResEvent>(res$, { op, timeout });

      bus.fire({
        type: 'sys.ui.route/change:req',
        payload: { tx, instance, path, hash, query },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, instance, error };
    },
  };

  return {
    instance: { bus: rx.bus.instance(bus), id: instance },
    $,
    dispose,
    dispose$,
    is,
    info,
    change,
    changed$: rx.payload<t.RouteChangedEvent>($, 'sys.ui.route/changed'),
  };
}

/**
 * Event matching.
 */
const matcher = (startsWith: string) => (input: any) => rx.isEvent(input, { startsWith });
RouteEvents.is = {
  base: matcher('sys.ui.route/'),
  instance: (e: t.Event, instance: Id) =>
    RouteEvents.is.base(e) && e.payload?.instance === instance,
};
