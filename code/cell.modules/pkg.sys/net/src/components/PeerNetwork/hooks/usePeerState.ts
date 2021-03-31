import { useEffect, useState } from 'react';
import { debounceTime } from 'rxjs/operators';

import { rx, t } from '../../../common';
import { PeerNetworkEvents } from '../PeerNetwork.Events';

/**
 * Monitors an event-bus keeping a set of state values
 * synced as peers interact with the network.
 */
export function usePeerState(args: { ref: string; bus: t.EventBus<any> }) {
  const { ref } = args;
  const bus = args.bus.type<t.PeerEvent>();
  const [status, setStatus] = useState<t.PeerNetworkStatus>();

  useEffect(() => {
    const events = PeerNetworkEvents({ bus });
    const $ = events.$;

    const updateState = async () => {
      const { self } = await events.status(ref).get();
      setStatus(self);
    };

    rx.payload<t.PeerNetworkStatusChangedEvent>($, 'Peer/Network/status:changed')
      .pipe(debounceTime(50))
      .subscribe(updateState);

    return () => events.dispose();
  }, [bus, ref]);

  return {
    network: status,
  };
}
