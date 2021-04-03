import { filter } from 'rxjs/operators';

import { t, rx, R } from '../../common';
import { Events } from '../Events';
import { Filter } from '../util';

/**
 * Handles strategies for connecting and disconnecting peers.
 */
export function ConnectionStrategy(args: {
  self: t.PeerId;
  bus: t.EventBus<any>;
}): t.PeerConnectionStrategy {
  const { self } = args;
  const bus = args.bus.type<t.PeerEvent>();
  const events = Events({ bus });
  const connections = events.connections(self);
  const netbus = events.data(self).bus<t.StrategyEvent>();

  const getConnections = async () => {
    const { network } = await events.status(self).get();
    return network?.connections || [];
  };

  const getDataConnections = async () =>
    Filter.connectionsAs<t.PeerConnectionDataStatus>(await getConnections(), 'data');

  /**
   * Auto purge connections when closed.
   */
  connections.closed$
    .pipe(filter(() => strategy.autoPurgeOnClose))
    .subscribe(() => events.purge(self).fire());

  /**
   * Auto propogate connections to peers.
   */
  connections.opened$
    .pipe(
      filter(() => strategy.autoMeshPropagation),
      filter((e) => e.kind === 'data'),
    )
    .subscribe(async (e) => {
      const { isReliable, metadata } = e.connection as t.PeerConnectionDataStatus;
      const connections = await getDataConnections();
      const peers = R.uniq(connections.map((conn) => conn.id.remote));
      if (peers.length > 0) {
        netbus.fire({
          type: 'NetworkStrategy/ensureConnected',
          payload: { peers, isReliable, metadata },
        });
      }
    });

  /**
   * Listen for incoming "ensure connections" events from other
   * peers broadcasting the set of ID's to connect to.
   */
  rx.payload<t.StrategyEnsureConnectedEvent>(netbus.event$, 'NetworkStrategy/ensureConnected')
    .pipe()
    .subscribe(async (e) => {
      const { isReliable, metadata } = e;
      const connections = await getDataConnections();
      const peers = e.peers
        .filter((id) => id !== self)
        .filter((id) => !connections.some((item) => item.id.remote === id));

      R.uniq(peers).forEach((remote) => {
        events.connection(self, remote).open.data({ isReliable, metadata });
      });
    });

  /**
   * API
   */
  const strategy = {
    dispose$: events.dispose$,
    dispose: events.dispose,

    autoPurgeOnClose: true,
    autoMeshPropagation: true,
  };

  return strategy;
}
