import { useEffect, useState } from 'react';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { rx, t } from './common';
import { useRoute } from './useRoute';

/**
 * Hook for working with the current URL route.
 * NOTE:
 *    Does causes redraws (as a feature).
 *    To observe changes via events without redraws, use the base hook [useRoute] directly.
 */
export function useRouteState(args: { instance: t.RouteInstance; dispose$?: Observable<any> }) {
  const route = useRoute(args);
  const { instance } = route;

  const [url, setUrl] = useState(route.url);

  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();
    route.url$.pipe(takeUntil(dispose$)).subscribe(setUrl);
    return dispose;
  }, [instance.id, instance.bus]); // eslint-disable-line

  /**
   * API.
   */
  return {
    instance,
    url,
  };
}
