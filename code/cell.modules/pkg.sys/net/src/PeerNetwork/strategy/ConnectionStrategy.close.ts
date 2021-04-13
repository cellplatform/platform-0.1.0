import { filter } from 'rxjs/operators';
import { t, rx } from '../common';

/**
 * Strategy for auto-purging connections when closed
 */
export function autoPerge(args: {
  self: t.PeerId;
  events: t.PeerNetworkEvents;
  isEnabled: () => boolean;
}) {
  const { self, events } = args;
  const connections = events.connections(self);

  connections.closed$
    .pipe(
      filter((e) => e.self === self),
      filter(() => args.isEnabled()),
    )
    .subscribe((e) => events.purge(self).fire());
}

/**
 * Strategy for closed connections are properly propergated
 * around the mesh.
 */
export function ensureClosed(args: {
  self: t.PeerId;
  events: t.PeerNetworkEvents;
  isEnabled: () => boolean;
}) {
  const { self, events } = args;
  const netbus = events.data(self).bus<t.MeshEvent>();
  const connections = events.connections(self);

  /**
   * List for local disconnection events, and alert the mesh.
   */
  connections.disconnectResponse$
    .pipe(
      filter(() => args.isEnabled()),
      filter((e) => e.self === self),
    )
    .subscribe(({ connection }) => {
      if (connection) {
        netbus.fire({
          type: 'sys.net/mesh/ensureConnectionClosed',
          payload: { from: self, connection },
        });
      }
    });

  /**
   * Listen for mesh
   */
  rx.payload<t.MeshEnsureConnectionClosedEvent>(
    netbus.event$,
    'sys.net/mesh/ensureConnectionClosed',
  )
    .pipe(
      filter(() => args.isEnabled()),
      filter((e) => e.from !== self),
    )
    .subscribe(async (e) => {
      const { peer } = await events.status(self).get();
      const connection = (peer?.connections || []).find(({ id }) => id === e.connection);
      if (connection && connection.isOpen) {
        events.connection(self, connection.peer.remote).close(connection.id);
      }
    });
}
