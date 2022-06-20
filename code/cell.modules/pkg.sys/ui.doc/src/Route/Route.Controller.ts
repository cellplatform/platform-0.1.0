import { RouteEvents } from './Route.Events';
import { rx, t, DEFAULT } from './common';

/**
 * Event controller for the URL router.
 */
export function RouteController(args: {
  instance: t.RouteInstance;
  filter?: (e: t.RouteEvent) => boolean;
  dispose$?: t.Observable<any>;
  location?: t.RouteLocation; // NB: use to override the default [window.location] API.
}) {
  const { filter, location = window.location } = args;

  const bus = rx.busAsType<t.RouteEvent>(args.instance.bus);
  const instance = args.instance.id ?? DEFAULT.INSTANCE;

  const events = RouteEvents({
    instance: args.instance,
    dispose$: args.dispose$,
    filter,
  });

  /**
   * Info (Module)
   */
  events.info.req$.subscribe(async (e) => {
    const { tx } = e;

    const href = location.href;
    const url = { href };
    const secure = location.protocol === 'https:';
    const localhost = location.hostname === 'localhost';

    const info: t.RouteInfo = { url, secure, localhost };
    bus.fire({
      type: 'sys.ui.route/info:res',
      payload: { tx, instance, info },
    });
  });

  /**
   * API
   */
  return events;
}
