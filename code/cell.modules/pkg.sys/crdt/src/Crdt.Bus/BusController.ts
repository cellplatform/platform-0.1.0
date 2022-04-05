import { BusControllerRefs } from './BusController.Refs';
import { BusEvents } from './BusEvents';
import { DEFAULT, pkg, rx, slug, t } from './common';
import { BusControllerSync } from './BusController.Sync';

type InstanceId = string;
type Milliseconds = number;

/**
 * Event controller.
 */
export function BusController(args: {
  id?: InstanceId;
  bus: t.EventBus<any>;
  filter?: (e: t.CrdtEvent) => boolean;
  sync?: { netbus: t.NetworkBus<any>; debounce?: Milliseconds };
}) {
  const { filter, id = DEFAULT.id, sync } = args;

  const bus = rx.busAsType<t.CrdtEvent>(args.bus);
  const events = BusEvents({ id, bus, filter });
  const { dispose, dispose$ } = events;

  /**
   * Initialize child controllers.
   */
  BusControllerRefs({ bus, events });
  if (sync) {
    const { netbus, debounce } = sync;
    BusControllerSync({ netbus, events, debounce });
  }

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
