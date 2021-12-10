import { BusEvents } from './BusEvents';
import { DEFAULT, pkg, rx, slug, t } from './common';

type InstanceId = string;

/**
 * Event controller.
 */
export function BusController(args: {
  id?: InstanceId;
  bus: t.EventBus<any>;
  filter?: (e: t.MyEvent) => boolean;
}) {
  const { filter, id = DEFAULT.id } = args;

  const bus = rx.busAsType<t.MyEvent>(args.bus);
  const events = BusEvents({ id, bus, filter });
  const { dispose, dispose$ } = events;

  /**
   * Info (Module)
   */
  events.info.req$.subscribe(async (e) => {
    const { tx = slug() } = e;

    const { name = '', version = '' } = pkg;
    const info: t.MyInfo = { module: { name, version } };

    bus.fire({
      type: 'my.namespace/info:res',
      payload: { tx, id, info },
    });
  });

  /**
   * API
   */
  return { dispose, dispose$, id, events };
}
