import { BusControllerRefs } from './BusController.Refs';
import { BusControllerSyncV1 } from './BusController.Sync.V1';
import { BusEvents } from './BusEvents';
import { DEFAULT, pkg, rx, slug, t } from './common';

type InstanceId = string;

/**
 * Event controller.
 */
export function BusController(args: {
  id?: InstanceId;
  bus: t.EventBus<any>;
  filter?: (e: t.CrdtEvent) => boolean;
  sync?: { netbus: t.NetworkBus<any>; version: '1' };
}) {
  const { filter, id = DEFAULT.id, sync } = args;

  const bus = rx.busAsType<t.CrdtEvent>(args.bus);
  const events = BusEvents({ id, bus, filter });
  const { dispose, dispose$ } = events;

  /**
   * Initialize to child controllers.
   */
  BusControllerRefs({ bus, events });
  if (sync?.version === '1') BusControllerSyncV1({ bus, netbus: sync.netbus, events });

  /**
   * Info (Module)
   */
  events.info.req$.subscribe(async (e) => {
    const { tx = slug() } = e;

    const { name = '', version = '', dependencies = {} } = pkg;
    const info: t.CrdtInfo = {
      module: { name, version },
      dataformat: { name: 'automerge', version: dependencies.automerge || '' },
    };

    bus.fire({
      type: 'sys.crdt/info:res',
      payload: { tx, id, info },
    });
  });

  /**
   * API
   */
  return { dispose, dispose$, id, events };
}
