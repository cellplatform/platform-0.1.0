import { rx, t } from '../common';
import { Events } from './Events';

/**
 * An event-bus distributed across a number of peers.
 */
export function PeerBus<E extends t.Event>(args: {
  self: t.PeerId;
  bus: t.EventBus<any>;
}): t.PeerBus<E> {
  const { self } = args;
  const events = Events(args.bus);
  const data = events.data(self);
  const { dispose, dispose$ } = events;

  const bus = rx.bus<E>();

  // Listen for incoming events from the network and pass into the bus.
  data.in$.subscribe((e) => bus.fire(e.data));

  // Maintain a list of connections.
  let connections: t.PeerConnectionStatus[];
  events.status(self).changed$.subscribe((e) => (connections = e.peer.connections));
  events
    .status(self)
    .get()
    .then((e) => (connections = e.peer?.connections || []));

  const send = async (event: E, filter?: t.PeerFilter) => {
    // Broadcast event to remote targets.
    const { sent } = await data.send(event, { filter });

    // Test the filter against the local peer, and fire locally if any matches found.
    if (filter) {
      const localMatch = connections
        .filter((ref) => ref.kind === 'data')
        .some(({ id, kind }) => filter({ peer: args.self, connection: { id, kind } }));
      if (localMatch) bus.fire(event);
    }
    if (!filter) bus.fire(event); // NB: No filter, so always fire out of local bus.

    // Finish up.
    return { event, sent };
  };

  /**
   * API
   */
  const api: t.PeerBus<E> = {
    self,
    event$: bus.event$,
    dispose,
    dispose$,

    get connections() {
      return connections;
    },

    fire(event: E) {
      data.send(event);
      bus.fire(event);
    },

    type<T extends t.Event>() {
      return api as unknown as t.PeerBus<T>;
    },

    /**
     * Target events at specific peers.
     */
    target: {
      /**
       * Fires an event over the local bus only.
       */
      async local(event) {
        return send(event, (e) => e.peer === args.self);
      },

      /**
       * Fires an event to remote peers only.
       */
      async remote(event) {
        return send(event, (e) => e.peer !== args.self);
      },

      /**
       * Broadcasts to a subset of peers.
       */
      filter(fn?: t.PeerFilter) {
        return {
          fire: (event) => send(event, fn),
        };
      },

      /**
       * Broadcasts to a subset of peers.
       */
      peer(...id: t.PeerId[]) {
        return {
          fire: (event) => send(event, (e) => id.includes(e.peer)),
        };
      },
    },
  };

  return api;
}
