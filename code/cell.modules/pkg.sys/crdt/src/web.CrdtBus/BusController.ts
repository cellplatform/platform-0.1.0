import { BusControllerRefs } from './BusController.Refs';
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
}) {
  const { filter, id = DEFAULT.id } = args;

  const bus = rx.busAsType<t.CrdtEvent>(args.bus);
  const events = BusEvents({ id, bus, filter });
  const { dispose, dispose$ } = events;

  /**
   * Initialize to child controllers.
   */
  BusControllerRefs({ id, bus, events });

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
