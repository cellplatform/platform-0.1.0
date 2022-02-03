import { DEFAULT, rx, slug, t, WebRuntime } from './common';
import { BusEvents } from './BusEvents';

type InstanceId = string;

/**
 * Event controller.
 */
export function BusController(args: {
  id?: InstanceId;
  bus: t.EventBus<any>;
  filter?: (e: t.MyEvent) => boolean;
}) {
  const id = args.id ?? DEFAULT.id;

  const bus = rx.busAsType<t.MyEvent>(args.bus);
  const events = BusEvents({ id, bus });
  const { dispose, dispose$ } = events;

  /**
   * Info (Module)
   */
  events.info.req$.subscribe(async (e) => {
    const { tx = slug() } = e;

    const module = WebRuntime.module;
    const info: t.MyInfo = { module };

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
