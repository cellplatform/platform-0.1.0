import { delay, filter } from 'rxjs/operators';

import { GroupController } from './BusController.Group';
import { BusEvents } from './BusEvents';
import { DEFAULT, rx, t, WebRuntime } from './common';

type InstanceId = string;

/**
 * Event controller.
 */
export function BusController(args: {
  id?: InstanceId;
  bus: t.EventBus<any>;
  netbus?: t.NetworkBus<any>;
  filter?: (e: t.WebRuntimeEvent) => boolean;
}) {
  const { netbus } = args;
  const id = args.id ?? DEFAULT.id;

  const bus = rx.busAsType<t.WebRuntimeEvent>(args.bus);
  const events = BusEvents({ id, bus });
  const { dispose, dispose$ } = events;

  /**
   * Initialize child controllers.
   */
  if (netbus) GroupController({ netbus, events, id, fireLocal: bus.fire });

  /**
   * Info (Module)
   */
  events.info.req$.pipe(delay(0)).subscribe(async (e) => {
    const { tx } = e;
    const module = WebRuntime.module;
    const info: t.WebRuntimeInfo = { module };
    const exists = Boolean(info);
    bus.fire({
      type: 'sys.runtime.web/info:res',
      payload: { tx, id, exists, info },
    });
  });

  /**
   * Netbus
   */
  events.netbus.req$.pipe(delay(0)).subscribe((e) => {
    const { tx } = e;
    const exists = Boolean(netbus);
    bus.fire({
      type: 'sys.runtime.web/netbus:res',
      payload: { tx, id, exists, netbus },
    });
  });

  /**
   * API
   */
  return { dispose, dispose$, id, events };
}
