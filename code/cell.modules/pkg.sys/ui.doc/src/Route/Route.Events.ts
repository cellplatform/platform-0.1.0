import { filter, takeUntil } from 'rxjs/operators';
import { time, rx, slug, t, DEFAULT } from './common';

type Id = string;

/**
 * Event API for the UI router.
 */
export function RouteEvents(args: {
  instance: t.RouteInstance;
  filter?: (e: t.RouteEvent) => boolean;
  dispose$?: t.Observable<any>;
}): t.RouteEventsDisposable {
  const { dispose, dispose$ } = rx.disposable(args.dispose$);

  const bus = rx.busAsType<t.RouteEvent>(args.instance.bus);
  const instance = args.instance.id ?? DEFAULT.INSTANCE;
  const is = RouteEvents.is;

  let _current: t.RouteInfoUrl = DEFAULT.DUMMY_URL;

  const $ = bus.$.pipe(
    takeUntil(dispose$),
    filter((e) => is.instance(e, instance)),
    filter((e) => args.filter?.(e) ?? true),
  );

  /**
   * Base information about the route.
   */
  const info: t.RouteEventsDisposable['info'] = {
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
  const change: t.RouteEventsDisposable['change'] = {
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

    path(path, options = {}) {
      return change.fire({ ...options, path });
    },

    hash(hash, options = {}) {
      return change.fire({ ...options, hash });
    },

    query(query, options = {}) {
      return change.fire({ ...options, query });
    },
  };

  /**
   * Changed.
   */
  const changed$ = rx.payload<t.RouteChangedEvent>($, 'sys.ui.route/changed');
  changed$.subscribe((e) => (_current = e.info.url));

  // NB: Done this way (with "getters") to protect them from the [clone] method.
  const current: t.RouteInfoUrl = {
    get href() {
      return _current.href;
    },
    get path() {
      return _current.path;
    },
    get query() {
      return _current.query;
    },
    get hash() {
      return _current.hash;
    },
  };

  const ready = new Promise<t.RouteEvents>((resolve) => {
    time.delay(0, async () => {
      // Initialize.
      const url = (await info.get()).info?.url;
      if (url && _current.href === '') _current = url;
      resolve(api.clone());
    });
  });

  const api: t.RouteEventsDisposable = {
    instance: { bus: rx.bus.instance(bus), id: instance },
    $,
    dispose,
    dispose$,
    is,
    info,
    change,
    changed$,
    current,

    ready: () => ready,

    clone() {
      const clone = { ...api };
      delete (clone as any).dispose;
      return clone;
    },
  };

  return api;
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
