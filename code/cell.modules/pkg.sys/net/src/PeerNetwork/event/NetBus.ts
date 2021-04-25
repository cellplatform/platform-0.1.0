import { rx, t } from '../common';
import { Events } from './Events';

/**
 * An event-bus distributed across a number of peers.
 */
export function NetBus<E extends t.Event>(args: {
  self: t.PeerId;
  bus: t.EventBus<any>;
}): t.NetBus<E> {
  const { self } = args;
  const events = Events(args.bus);
  const data = events.data(self);
  const { dispose, dispose$ } = events;

  const local = rx.bus<E>();

  // Listen for incoming events from the network and pass into the bus.
  data.in$.subscribe((e) => local.fire(e.data));

  // Maintain a list of connections.
  let connections: t.PeerConnectionStatus[];
  events.status(self).changed$.subscribe((e) => (connections = e.peer.connections));
  events
    .status(self)
    .get()
    .then((e) => (connections = e.peer?.connections || []));

  /**
   * API
   */
  const api: t.NetBus<E> = {
    event$: local.event$,
    dispose,
    dispose$,

    get connections() {
      return connections;
    },

    fire(event: E) {
      data.send(event);
      local.fire(event);
    },

    type<T extends t.Event>() {
      return (api as unknown) as t.NetBus<T>;
    },

    /**
     * Target events as specific peers.
     */
    target(filter?: t.PeerConnectionFilter) {
      const fire: t.NetBusTarget<E>['fire'] = async (event) => {
        // Fire event to remote targets.
        const { sent } = await data.send(event, { filter });

        // Test the filter against the local peer, and fire locally if any matches found.
        if (filter) {
          const localMatch = connections
            .filter((ref) => ref.kind === 'data')
            .some(({ id, kind }) => filter({ peer: self, connection: { id, kind } }));
          if (localMatch) local.fire(event);
        }
        if (!filter) local.fire(event); // NB: No filter, so always fire out of local bus.

        // Finish up.
        return { event, sent };
      };

      return { fire };
    },
  };

  return api;
}
