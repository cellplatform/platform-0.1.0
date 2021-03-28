import { useEffect, useState } from 'react';
import { merge } from 'rxjs';
import { filter } from 'rxjs/operators';

import { t, cuid } from '../../../common';
import { PeerNetworkEvents } from '../PeerNetwork.Events';

/**
 * Monitors an event-bus keeping a set of state values
 * synced as peers interact with the network.
 */
export function usePeerState(args: { ref: string; bus: t.EventBus<any> }) {
  const { ref } = args;
  const bus = args.bus.type<t.PeerNetworkEvent>();
  const [status, setStatus] = useState<t.PeerNetworkStatus>();

  useEffect(() => {
    const events = PeerNetworkEvents({ bus });
    const $ = events.$;

    const updateState = async () => {
      const { self } = await events.status(ref).get();
      setStatus(self);
    };

    const types: t.PeerNetworkEvent['type'][] = [
      'PeerNetwork/init:res',
      'PeerNetwork/connect:res',
      'PeerNetwork/purge:res',
      'PeerNetwork/connection:closed',
    ];

    const changed$ = merge(
      $.pipe(
        filter((e) => e.payload.ref === ref),
        filter((e) => types.includes(e.type)),
      ),
    );

    changed$.subscribe(updateState);

    return () => events.dispose();
  }, [bus, ref]);

  return {
    network: status,
  };
}
