import { Observable, Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';

import { DEFAULT, pkg, rx, t } from './common';
import { JsonEvents } from './Json.Events';

type Cache = { [key: string]: t.Json };
type Change = { key: string; state: t.Json };

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
   * State.
   */
  const cache: Cache = {};
  const changed$ = new Subject<Change>();
  const change = (key: string, fn: (prev: t.Json) => t.Json) => {
    cache[key] = fn(cache[key]);
    changed$.next({ key, state: cache[key] });
  };

  /**
   * Info (Module)
   */
  events.info.req$.pipe(delay(0)).subscribe((e) => {
    const { tx } = e;
    const { name = '', version = '' } = pkg;
    const info: t.JsonInfo = { module: { name, version } };
    bus.fire({
      type: 'sys.json/info:res',
      payload: { tx, instance, info },
    });
  });

  /**
   * State.get
   */
  events.state.req$.pipe(delay(0)).subscribe(async (e) => {
    const { tx, key = DEFAULT.KEY } = e;
    const state = cache[key];
    bus.fire({
      type: 'sys.json/state:res',
      payload: { instance, tx, key, state },
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
