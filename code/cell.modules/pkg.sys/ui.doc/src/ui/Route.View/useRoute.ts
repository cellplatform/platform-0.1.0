import { useEffect, useRef } from 'react';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DEFAULT, R, rx, t, RouteBus } from './common';

/**
 * Hook for working with the current URL route.
 * NOTE:
 *    Does NOT cause redraw (as a feature).
 */
export function useRoute(args: { instance: t.RouteInstance; dispose$?: Observable<any> }) {
  const instance = { bus: rx.bus.instance(args.instance.bus), id: args.instance.id };

  const urlRef$ = useRef(new Subject<t.RouteUrl>());
  const urlRef = useRef<t.RouteUrl>(R.clone(DEFAULT.URL));

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const { instance, dispose$ } = args;
    const route = RouteBus.Events({ instance, dispose$ });

    const next = (e: t.RouteUrl) => {
      urlRef.current = e;
      urlRef$.current.next(e);
    };

    route.current.$.subscribe((e) => next(e.info.url));
    route.ready().then(() => next(route.current.url));

    return () => route.dispose();
  }, [instance.id, instance.bus]); // eslint-disable-line

  /**
   * API.
   */
  return {
    instance,
    url$: urlRef$.current.pipe(takeUntil(args.dispose$ || new Subject())),
    get url() {
      return urlRef.current;
    },
  };
}
