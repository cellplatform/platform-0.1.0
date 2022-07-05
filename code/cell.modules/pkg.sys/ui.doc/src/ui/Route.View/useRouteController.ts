import { useEffect, useRef } from 'react';

import { RouteBus } from '../Route.Bus';
import { rx, slug, t } from './common';

/**
 * Hook for initializing a route-controller singleton safely.
 */
export function useRouteController(args: {
  bus?: t.EventBus<any>;
  mock?: boolean;
  onReady?: t.RoutReadyHandler;
}) {
  const busRef = useRef(args.bus ?? rx.bus());
  const slugRef = useRef(slug());

  const bus = busRef.current;
  const busid = rx.bus.instance(bus);
  const id = args.mock ? `router.mock.${slugRef.current}` : `router.${slugRef.current}`;
  const instance = { bus, id };

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();

    const mock = args.mock ? RouteBus.Dev.mock('https://mock.org/') : undefined;
    const getHref = mock?.getHref;
    const pushState = mock?.pushState;
    const route = RouteBus.Controller({ instance, getHref, pushState, dispose$ });

    args.onReady?.({ route });
    return dispose;
  }, [args.mock, busid]); // eslint-disable-line

  /**
   * API
   */
  return { instance };
}
