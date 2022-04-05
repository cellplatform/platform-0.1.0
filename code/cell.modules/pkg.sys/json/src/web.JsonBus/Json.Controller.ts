import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DEFAULT, Patch, pkg, rx, t } from './common';
import { JsonEvents } from './Json.Events';

type J = t.JsonMap;
type Cache = { [key: string]: J };

/**
 * Controller that manages a cache of immutable JSON state values.
 */
export function JsonController(args: {
  instance: t.JsonBusInstance;
  filter?: t.JsonEventFilter;
  dispose$?: Observable<any>;
}) {
  const bus = rx.busAsType<t.JsonEvent>(args.instance.bus);
  const instance = args.instance.id;

  const events = JsonEvents({
    instance: args.instance,
    dispose$: args.dispose$,
    filter: args.filter,
  });
  const { dispose, dispose$ } = events;

  /**
   * State
   */
  const cache: Cache = {};
  const changed$ = new Subject<t.JsonStateChange>();
  const change = (op: t.JsonStateChangeOperation, key: string, fn: (prev: J) => J) => {
    cache[key] = fn(cache[key]);
    changed$.next({ key, op, value: cache[key] });
    if (cache[key] === undefined) delete cache[key];
  };

  /**
   * Info (Module)
   */
  events.info.req$.subscribe((e) => {
    const { tx } = e;
    const { name = '', version = '' } = pkg;
    const keys = Object.keys(cache);
    const info: t.JsonInfo = { module: { name, version }, keys };
    bus.fire({
      type: 'sys.json/info:res',
      payload: { tx, instance, info },
    });
  });

  /**
   * State.get (READ)
   */
  events.state.get.req$.subscribe((e) => {
    const { tx, key = DEFAULT.KEY } = e;
    const state = cache[key];
    bus.fire({
      type: 'sys.json/state.get:res',
      payload: { instance, tx, key, value: state },
    });
  });

  /**
   * State.put (UPDATE/OVERWRITE)
   */
  events.state.put.req$.subscribe((e) => {
    const { tx, key = DEFAULT.KEY } = e;
    change('replace', key, (prev) => e.value);
    bus.fire({
      type: 'sys.json/state.put:res',
      payload: { instance, tx, key },
    });
  });

  /**
   * State.patch (UPDATE)
   */
  events.state.patch.req$.subscribe((e) => {
    const { tx, key, op } = e;
    const state = cache[key];
    change(op, key, () => Patch.apply(state, e.patches));
    bus.fire({
      type: 'sys.json/state.patch:res',
      payload: { instance, tx, key },
    });
  });

  /**
   * API
   */
  return {
    instance: { bus: rx.bus.instance(bus), id: instance },
    dispose,
    dispose$,
    changed$: changed$.pipe(takeUntil(dispose$)),
  };
}
