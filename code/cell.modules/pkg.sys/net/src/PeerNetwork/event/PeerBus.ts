import { rx, t, Uri } from '../common';
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
    /**
     * Broadcast event to REMOTE targets.
     */
    const res = await data.send(event, { filter });
    const targetted = res.sent.map(({ peer, connection }) => {
      return Uri.connection.create('data', peer, connection);
    });

    /**
     * Broadcast through LOCAL observable.
     */
    if (filter) {
      // Test the filter against the local peer, and fire locally if any matches found.
      const localMatch = connections
        .filter((ref) => ref.kind === 'data')
        .some(({ id, kind }) => filter({ peer: self, connection: { id, kind } }));
      if (localMatch) bus.fire(event);
    } else {
      // NB: No filter given, so default to firing out of the local bus.
      bus.fire(event);
    }

    // Finish up.
    return { event, targetted };
  };

  /**
   * API
   */
  const api: t.PeerBus<E> = {
    $: bus.$,
    dispose,
    dispose$,

    self,
    get connections() {
      return connections;
    },

    fire(event: E) {
      send(event);
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
      filter(fn?: t.NetworkBusFilter) {
        return {
          fire(event) {
            return send(event, (e) => {
              if (!fn) return true;
              const uri = Uri.connection.create(e.connection.kind, e.peer, e.connection.id);
              return fn({ uri });
            });
          },
        };
      },

      /**
       * Broadcasts to a subset of peers.
       */
      node(...target: t.NetworkBusUri[]) {
        return {
          fire: (event) => send(event, (e) => target.includes(e.peer)),
        };
      },
    },
  };

  return api;
}
