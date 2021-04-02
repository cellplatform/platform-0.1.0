import { useEffect, useState } from 'react';
import { debounceTime } from 'rxjs/operators';

import { rx, t } from '../../common';
import { Events } from '../Events';

/**
 * Monitors an event-bus keeping a set of state values
 * synced as peers interact with the network.
 */
export function usePeerNetworkState(args: { self: t.PeerId; bus: t.EventBus<any> }) {
  const bus = args.bus.type<t.PeerEvent>();
  const [network, setNetwork] = useState<t.PeerNetworkStatus>();

  useEffect(() => {
    const events = Events({ bus });
    const $ = events.$;

    const updateState = async () => {
      const { network } = await events.status(args.self).get();
      setNetwork(network);
    };

    rx.payload<t.PeerNetworkStatusChangedEvent>($, 'Peer:Network/status:changed')
      .pipe(debounceTime(50))
      .subscribe(updateState);

    return () => events.dispose();
  }, [bus, args.self]);

  return {
    network,
  };
}
