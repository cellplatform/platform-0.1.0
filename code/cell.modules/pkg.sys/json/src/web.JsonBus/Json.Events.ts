import { filter, takeUntil } from 'rxjs/operators';
import { rx, slug, t, DEFAULT } from './common';

type J = t.Json;
type Id = string;

/**
 * Event API for the "WebRuntime"
 */
export function JsonEvents(args: {
  instance: t.JsonBusInstance;
  filter?: t.JsonEventFilter;
  dispose$?: t.Observable<any>;
}): t.JsonEvents {
  const { dispose, dispose$ } = rx.disposable(args.dispose$);

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
      const { timeout = DEFAULT.TIMEOUT } = options;
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
   * State.
   */
  const state: t.JsonEvents['state'] = {
    get: {
      req$: rx.payload<t.JsonStateReqEvent>($, 'sys.json/state:req'),
      res$: rx.payload<t.JsonStateResEvent>($, 'sys.json/state:res'),
      async fire(options = {}) {
        const { timeout = DEFAULT.TIMEOUT, key = DEFAULT.KEY } = options;
        const tx = slug();

        const op = 'state.get';
        const res$ = state.get.res$.pipe(filter((e) => e.tx === tx));
        const first = rx.asPromise.first<t.JsonStateResEvent>(res$, { op, timeout });

        bus.fire({
          type: 'sys.json/state:req',
          payload: { tx, instance, key },
        });

        const res = await first;
        if (res.payload) return res.payload;

        const error = res.error?.message ?? 'Failed';
        return { tx, instance, key, error };
      },
    },

    put: {
      req$: rx.payload<t.JsonStatePutReqEvent>($, 'sys.json/state.put:req'),
      res$: rx.payload<t.JsonStatePutResEvent>($, 'sys.json/state.put:res'),
      async fire<T extends J = J>(value: T, options: t.JsonEventsPutOptions = {}) {
        // return null as any; // TEMP 🐷
        const { timeout = DEFAULT.TIMEOUT, key = DEFAULT.KEY } = options;
        const tx = slug();

        const op = 'state.put';
        const res$ = state.put.res$.pipe(filter((e) => e.tx === tx));
        const first = rx.asPromise.first<t.JsonStatePutResEvent>(res$, { op, timeout });

        bus.fire({
          type: 'sys.json/state.put:req',
          payload: { tx, instance, key, value },
        });

        const res = await first;
        if (res.payload) return res.payload;

        const error = res.error?.message ?? 'Failed';
        return { tx, instance, key, error };
      },
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
    state,
    get: state.get.fire,
    put: state.put.fire,
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
