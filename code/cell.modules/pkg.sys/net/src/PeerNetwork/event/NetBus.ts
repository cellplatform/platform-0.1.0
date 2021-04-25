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

  const netbus = rx.bus<E>();

  // Listen for incoming events from the network and pass into the bus.
  data.in$.subscribe((e) => netbus.fire(e.data));

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
    self,
    event$: netbus.event$,
    dispose,
    dispose$,

    get connections() {
      return connections;
    },

    fire(event: E) {
      data.send(event);
      netbus.fire(event);
    },

    type<T extends t.Event>() {
      return (api as unknown) as t.NetBus<T>;
    },

    /**
     * Target events as specific peers.
     */
    target(filter?: t.PeerConnectionFilter) {
      type N = t.NetBusTarget<E>;

      const send = async (event: E, filter?: t.PeerConnectionFilter) => {
        // Broadcast event to remote targets.
        const { sent } = await data.send(event, { filter });

        // Test the filter against the local peer, and fire locally if any matches found.
        if (filter) {
          const localMatch = connections
            .filter((ref) => ref.kind === 'data')
            .some(({ id, kind }) => filter({ peer: args.self, connection: { id, kind } }));
          if (localMatch) netbus.fire(event);
        }
        if (!filter) netbus.fire(event); // NB: No filter, so always fire out of local bus.

        // Finish up.
        return { event, sent };
      };

      /**
       * Fires a targetted event.
       */
      const fire: N['fire'] = async (event) => send(event, filter);

      /**
       * Fires an event only over the local bus.
       * NB: This is a convenience method and overrides any existing filter.
       */
      const local: N['local'] = async (event) => send(event, (e) => e.peer === args.self);

      /**
       * Fires an event to remote peers only.
       * NB: This is a convience method and [augments] any existing filter.
       */
      const remote: N['remote'] = async (event) =>
        send(event, (e) => (e.peer === args.self ? false : filter ? filter(e) : true));

      return { fire, local, remote };
    },
  };

  return api;
}
