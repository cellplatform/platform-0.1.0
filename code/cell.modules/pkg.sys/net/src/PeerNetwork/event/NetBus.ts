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

  // Lazy load current connections (and keep up-to-date).
  let connections: t.PeerConnectionStatus[] | undefined;
  events.status(self).changed$.subscribe((e) => (connections = e.peer.connections));
  const getConnections = async () => {
    if (!connections) connections = (await events.status(self).get()).peer?.connections;
    return connections || [];
  };

  /**
   * API
   */
  const netbus = {
    dispose,
    dispose$,

    event$: bus.network.event$,
    type: bus.network.type,
    fire(event: E) {
      data.send(event);
      fireLocal(event);
    },

    /**
     * Target events as specific peers.
     */
    target(filter?: t.PeerConnectionFilter) {
      const api = {
        async fire(event: E) {
          // Fire event to remote targets.
          const res = await data.send(event, { filter });

          // Test the filter against the local peer, and fire locally if any matches found.
          if (filter) {
            const localMatch = (await getConnections())
              .filter((ref) => ref.kind === 'data')
              .some(({ id, kind }) => filter({ peer: self, connection: { id, kind } }));
            if (localMatch) fireLocal(event);
          }
          if (!filter) fireLocal(event); // NB: No filter, so always fire out of local bus.

          // Finish up.
          return { event, sent: res.sent };
        },
      };
      return api;
    },
  };

  return netbus;
}
