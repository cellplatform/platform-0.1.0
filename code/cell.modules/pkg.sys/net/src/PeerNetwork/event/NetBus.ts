import { Subject } from 'rxjs';

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

  const local$ = new Subject<t.Event>();
  const fireLocal = (event: t.Event) => local$.next(event);
  const bus = {
    local: args.bus.type<t.PeerEvent>(),
    network: rx.bus<E>(local$),
  };

  // Listen for incoming events from the network and pass into the bus.
  data.in$.subscribe((e) => local$.next(e.data));

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
  const netbus: t.NetBus<E> = {
    event$: bus.network.event$,
    dispose,
    dispose$,

    get connections() {
      return connections;
    },

    fire(event: E) {
      data.send(event);
      fireLocal(event);
    },

    type<T extends t.Event>() {
      return (netbus as unknown) as t.NetBus<T>;
    },

    /**
     * Target events as specific peers.
     */
    target(filter?: t.PeerConnectionFilter) {
      const api = {
        async fire(event: E) {
          // Fire event to remote targets.
          const { sent } = await data.send(event, { filter });

          // Test the filter against the local peer, and fire locally if any matches found.
          if (filter) {
            const localMatch = connections
              .filter((ref) => ref.kind === 'data')
              .some(({ id, kind }) => filter({ peer: self, connection: { id, kind } }));
            if (localMatch) fireLocal(event);
          }
          if (!filter) fireLocal(event); // NB: No filter, so always fire out of local bus.

          // Finish up.
          return { event, sent };
        },
      };
      return api;
    },
  };

  return netbus;
}
