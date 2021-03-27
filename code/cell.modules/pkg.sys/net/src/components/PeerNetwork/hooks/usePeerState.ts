import { useEffect, useState } from 'react';
import { merge } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t } from '../../../common';
import { PeerNetworkEvents } from '../PeerNetwork.Events';

/**
 * Monitors an event-bus keeping a set of state values
 * synced as peers interact with the network.
 */
export function usePeerState(args: { id: string; bus: t.EventBus<any> }) {
  const { id } = args;
  const bus = args.bus.type<t.PeerNetworkEvent>();
  const [network, setNetwork] = useState<t.PeerNetworkStatus>();

  useEffect(() => {
    const events = PeerNetworkEvents({ bus });
    const $ = events.$;

    const updateState = async () => {
      const { network } = await events.status(id).get();
      setNetwork(network);
    };

    const types: t.PeerNetworkEvent['type'][] = [
      'PeerNetwork/create:res',
      'PeerNetwork/connect:res',
      'PeerNetwork/purge:res',
      'PeerNetwork/connection:closed',
    ];

    const changed$ = merge(
      $.pipe(
        filter((e) => e.payload.ref === id),
        filter((e) => types.includes(e.type)),
      ),
    );

    changed$.subscribe(updateState);

    return () => events.dispose();
  }, [bus, id]);

  return {
    network,
  };
}
