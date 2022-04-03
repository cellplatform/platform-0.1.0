import { JsonEvents } from './Json.Events';
import { pkg, rx, slug, t } from './common';

/**
 * Event controller.
 */
export function JsonController(args: {
  instance: t.JsonBusInstance;
  filter?: (e: t.JsonEvent) => boolean;
}) {
  const { filter } = args;

  const bus = rx.busAsType<t.JsonEvent>(args.instance.bus);
  const instance = args.instance.id;
  const events = JsonEvents({ instance: args.instance, filter });
  const { dispose, dispose$ } = events;

  /**
   * Info (Module)
   */
  events.info.req$.subscribe(async (e) => {
    const { tx = slug() } = e;

    const { name = '', version = '' } = pkg;
    const info: t.JsonInfo = { module: { name, version } };

    bus.fire({
      type: 'sys.json/info:res',
      payload: { tx, instance, info },
    });
  });

  /**
   * API
   */
  return {
    instance: { bus: rx.bus.instance(bus), id: instance },
    dispose,
    dispose$,
    events,
  };
}
