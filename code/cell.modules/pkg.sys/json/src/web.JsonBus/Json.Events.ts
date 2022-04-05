import { filter, takeUntil } from 'rxjs/operators';
import { rx, slug, t, DEFAULT, Patch } from './common';

type J = t.JsonMap;
type Id = string;
type Milliseconds = number;
type KeyPath = string;

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
   * GET
   */
  const get: t.JsonEventsState['get'] = {
    req$: rx.payload<t.JsonStateGetReqEvent>($, 'sys.json/state.get:req'),
    res$: rx.payload<t.JsonStateGetResEvent>($, 'sys.json/state.get:res'),
    async fire<T extends J = J>(
      options: { timeout?: Milliseconds; key?: KeyPath; initial?: T | (() => T) } = {},
    ) {
      type R = t.JsonStateGetRes<T>;
      const response = (value?: T, error?: string): R => {
        return { tx, instance, key, value, error };
      };

      const { timeout = DEFAULT.TIMEOUT, key = DEFAULT.KEY } = options;
      const tx = slug();

      const op = 'state.get';
      const res$ = get.res$.pipe(filter((e) => e.tx === tx && e.key === key));

      const fire = async (): Promise<R> => {
        const first = rx.asPromise.first<t.JsonStateGetResEvent>(res$, { op, timeout });
        bus.fire({
          type: 'sys.json/state.get:req',
          payload: { tx, instance, key },
        });

        const res = await first;
        if (res.payload) return res.payload as R;

        const error = res.error?.message ?? 'Failed';
        return response(undefined, error);
      };

      const res = await fire();

      // Value not found, look for an initial value.
      if (!res.value && options.initial !== undefined) {
        const initial = typeof options.initial === 'function' ? options.initial() : options.initial;
        if (initial) {
          const write = await put.fire(initial, { key, timeout });
          if (write.error) return response(undefined, write.error);
          return response(initial);
        }
      }

      return res;
    },
  };

  /**
   * PUT
   */
  const put: t.JsonEventsState['put'] = {
    req$: rx.payload<t.JsonStatePutReqEvent>($, 'sys.json/state.put:req'),
    res$: rx.payload<t.JsonStatePutResEvent>($, 'sys.json/state.put:res'),
    async fire<T extends J = J>(value: T, options: { timeout?: Milliseconds; key?: KeyPath } = {}) {
      const { timeout = DEFAULT.TIMEOUT, key = DEFAULT.KEY } = options;
      const tx = slug();

      const op = 'state.put';
      const res$ = put.res$.pipe(filter((e) => e.tx === tx && e.key === key));
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
  };

  /**
   * PATCH
   */
  const patch: t.JsonEventsState['patch'] = {
    req$: rx.payload<t.JsonStatePatchReqEvent>($, 'sys.json/state.patch:req'),
    res$: rx.payload<t.JsonStatePatchResEvent>($, 'sys.json/state.patch:res'),
    async fire<T extends J = J>(
      fn: t.JsonStateMutator<T>,
      options: { timeout?: Milliseconds; key?: KeyPath; initial?: T | (() => T) } = {},
    ): Promise<t.JsonStatePatchRes> {
      const { timeout = DEFAULT.TIMEOUT, key = DEFAULT.KEY, initial } = options;
      const tx = slug();

      const response = (error?: string): t.JsonStatePatchRes => {
        return { tx, instance, key, error };
      };

      const current = await get.fire({ timeout, key, initial });
      if (current.error) return response(current.error);

      const value = current.value;
      if (!value) {
        const error = `Failed to patch, could not retrieve current state (key="${key}"). Ensure the [sys.json] controller has been started (instance="${instance}").`;
        return response(error);
      }

      const op = 'state.patch';
      const res$ = patch.res$.pipe(filter((e) => e.tx === tx && e.key === key));
      const first = rx.asPromise.first<t.JsonStatePatchResEvent>(res$, { op, timeout });

      const change = await Patch.changeAsync<T>(value as any, fn);
      bus.fire({
        type: 'sys.json/state.patch:req',
        payload: { tx, instance, key, op: change.op, patches: change.patches },
      });

      const res = await first;
      if (res.payload) return res.payload;

      const error = res.error?.message ?? 'Failed';
      return { tx, instance, key, error };
    },
  };

  /**
   * State.
   */
  const state: t.JsonEventsState = { get, put, patch };

  /**
   * JSON (key-pathed convenience method).
   */
  const json = <T extends J = J>(
    args: t.JsonEventsMethodsOptions<T> = {},
  ): t.JsonEventsMethods<T> => {
    type O = { timeout?: Milliseconds };
    const asTimeout = (options: O) => options.timeout ?? args.timeout ?? DEFAULT.TIMEOUT;
    const { key, initial } = args;

    return {
      get(options = {}) {
        const timeout = asTimeout(options);
        return get.fire<T>({ key, timeout, initial });
      },
      put(value, options = {}) {
        const timeout = asTimeout(options);
        return put.fire<T>(value, { key, timeout });
      },
      patch(fn, options = {}) {
        const timeout = asTimeout(options);
        return patch.fire<T>(fn, { key, timeout, initial });
      },
    };
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
    json,
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
