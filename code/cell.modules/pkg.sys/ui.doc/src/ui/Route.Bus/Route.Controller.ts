import { delay } from 'rxjs/operators';

import { rx, t } from './common';
import { QueryParams } from './Url.QueryParams';
import { RouteEvents } from './Route.Events';

/**
 * Event controller for the URL router.
 */
export function RouteController(args: {
  instance: t.RouteInstance;
  dispose$?: t.Observable<any>;
  getHref?: () => string; // Factory producing the current location URL.
  pushState?: (data: any, title: string, url?: string) => void;
}) {
  const isMock = Boolean(args.getHref);
  const getHref = () => new URL(args.getHref ? args.getHref() : location.href);

  const bus = rx.busAsType<t.RouteEvent>(args.instance.bus);
  const instance = args.instance.id;

  const events = RouteEvents({
    instance: args.instance,
    dispose$: args.dispose$,
  });

  const toInfo = (url: URL): t.RouteInfo => {
    const href = url.href;
    const path = url.pathname;
    const hash = url.hash.replace(/^\#/, '');
    const query = QueryParams(url).toObject();
    const secure = url.protocol === 'https:';
    const localhost = url.hostname === 'localhost';
    return {
      url: { href, path, hash, query },
      secure,
      localhost,
    };
  };

  /**
   * Info (Module).
   */
  events.info.req$.pipe(delay(0)).subscribe((e) => {
    // NB: delay to ensure the callers treat this as async.
    const { tx } = e;
    const url = getHref();
    const info = toInfo(url);
    bus.fire({
      type: 'sys.ui.route/info:res',
      payload: { tx, instance, info },
    });
  });

  /**
   * Change.
   */
  events.change.req$.pipe(delay(0)).subscribe((e) => {
    // NB: delay to ensure the callers treat this as async.
    const { tx } = e;
    const url = getHref();
    const params = QueryParams(url);

    if (typeof e.path === 'string') url.pathname = e.path;
    if (typeof e.hash === 'string') url.hash = e.hash;

    if (Array.isArray(e.query)) {
      e.query.forEach(({ key, value }) => params.set(key, value));
    } else if (typeof e.query === 'object') {
      const query = e.query as t.RouteQuery;
      QueryParams(url).clear();
      Object.keys(query).forEach((key) => params.set(key, query[key]));
    }

    try {
      if (args.pushState) args.pushState({}, '', url.href);
      if (!args.pushState) history.pushState({}, '', url.href);

      // Fire response.
      bus.fire({
        type: 'sys.ui.route/change:res',
        payload: { tx, instance, info: toInfo(url) },
      });
    } catch (error: any) {
      bus.fire({
        type: 'sys.ui.route/change:res',
        payload: { tx, instance, error: error.message },
      });
    }
  });

  /**
   * Changed.
   */
  events.change.res$.subscribe((e) => {
    const info = toInfo(getHref());
    bus.fire({
      type: 'sys.ui.route/current',
      payload: { instance, info },
    });
  });

  /**
   * Window "popstate" event.
   * Fires when the back-button is clicked within the browser.
   *
   * Ref:
   *    https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
   *
   */
  if (!isMock) {
    const onPopState = (e: PopStateEvent) => {
      const path = location.pathname;
      const hash = location.search;
      const query = QueryParams(location.href).toObject();
      events.change.fire({ path, hash, query });
    };
    window.addEventListener('popstate', onPopState);
    events.dispose$.subscribe(() => window.removeEventListener('popstate', onPopState));
  }

  /**
   * API
   */
  return events;
}
