import { filter } from 'rxjs/operators';

import { rx, t } from '../../common';

/**
 * Strategy for closed connections the close event is properly
 * propagated around the mesh network.
 */
export function EnsureClosedStrategy(args: {
  self: t.PeerId;
  events: t.PeerNetworkEvents;
  isEnabled: () => boolean;
}) {
  const { self, events } = args;
  const netbus = events.data(self).netbus();
  const connections = events.connections(self);

  /**
   * Listen for local disconnection events, and alert the mesh.
   */
  connections.disconnect.req$
    .pipe(
      filter(() => args.isEnabled()),
      filter((e) => e.self === self),
    )
    .subscribe(({ connection }) => {
      if (connection) {
        netbus.fire({
          type: 'sys.net/group/conn/ensure:closed',
          payload: { source: self, connection },
        });
      }
    });

  /**
   * Listen for mesh alerting that a connection is closed.
   */
  rx.payload<t.GroupEnsureConnectionClosedEvent>(netbus.event$, 'sys.net/group/conn/ensure:closed')
    .pipe(
      filter(() => args.isEnabled()),
      filter((e) => e.source !== self),
    )
    .subscribe(async (e) => {
      const { peer } = await events.status(self).get();
      const connection = (peer?.connections || []).find(({ id }) => id === e.connection);
      if (connection) {
        const remote = connection.peer.remote.id;
        events.connection(self, remote).close(connection.id);
      }
    });
}
