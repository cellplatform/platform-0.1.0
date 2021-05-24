import { delay, filter } from 'rxjs/operators';
import { R, rx, t, FilterUtil } from '../../common';

/**
 * Strategy for auto propogating connections to all peers.
 */
export function AutoPropagationStrategy(args: {
  netbus: t.PeerNetworkBus<any>;
  events: t.PeerNetworkEvents;
  isEnabled: () => boolean;
}) {
  const { events } = args;
  const netbus = args.netbus as t.PeerNetworkBus<t.NetGroupEvent>;
  const self = netbus.self;
  const connections = events.connections(self);

  const getConnections = async () => {
    const { peer } = await events.status(self).get();
    return peer?.connections || [];
  };

  const getDataConnections = async () =>
    FilterUtil.connectionsAs<t.PeerConnectionDataStatus>(await getConnections(), 'data');

  /**
   * Fire "ensure connected" events to peers when a connection is started locally.
   */
  connections.connect.res$
    .pipe(
      delay(0),
      filter(() => args.isEnabled()),
      filter((e) => e.kind === 'data'),
      filter((e) => Boolean(e.connection)),
      filter((e) => e.direction === 'outgoing'),
    )
    .subscribe(async (e) => {
      const started = e.connection as t.PeerConnectionDataStatus;
      const current = await getDataConnections();

      if (current.length > 0) {
        const { isReliable } = started;

        const connections = R.uniq(
          current.map((conn) => ({
            peer: conn.peer.remote.id,
            id: conn.id,
          })),
        );

        netbus.fire({
          type: 'sys.net/group/conn/ensure:data',
          payload: { source: self, connections, isReliable },
        });
      }
    });

  /**
   * Listen for incoming "ensure connected" events from other
   * peers broadcasting the set of ID's to connect to.
   */
  rx.payload<t.NetGroupEnsureConnectedDataEvent>(netbus.$, 'sys.net/group/conn/ensure:data')
    .pipe(delay(0))
    .subscribe(async (e) => {
      const { isReliable } = e;
      const current = await getDataConnections();

      const connections = R.uniq(
        e.connections
          .filter((item) => item.peer !== self)
          .filter((item) => !current.some((conn) => conn.id === item.id))
          .filter((item) => !current.some((conn) => conn.peer.remote.id === item.peer)),
      );

      connections.forEach((item) => {
        events.connection(self, item.peer).open.data({ isReliable });
      });
    });
}
