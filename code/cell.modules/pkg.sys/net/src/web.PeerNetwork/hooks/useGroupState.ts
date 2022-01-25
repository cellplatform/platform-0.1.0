import { useEffect, useState } from 'react';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

import { R, t } from '../common';
import { PeerEvents, GroupEvents } from '../../web.PeerNetwork.events';

/**
 * Manages listening to the network to determine the group peers
 * and any pending connections.
 */
export function useGroupState(args: { bus: t.EventBus<any>; netbus: t.PeerNetbus<any> }) {
  const bus = args.bus as t.EventBus<t.PeerEvent>;
  const netbus = args.netbus as t.PeerNetbus<t.NetGroupEvent>;

  const [status, setStatus] = useState<t.GroupPeerStatus>();

  useEffect(() => {
    const self = netbus.self;
    const events = PeerEvents(bus);
    const group = GroupEvents(netbus);

    const updateStatus = async () => {
      const status = await group.connections().get();
      setStatus(status);
    };

    events
      .status(self)
      .changed$.pipe(distinctUntilChanged((prev, next) => R.equals(ids(prev.peer), ids(next.peer))))
      .subscribe((e) => updateStatus());

    group
      .refresh()
      .$.pipe(debounceTime(30))
      .subscribe(() => updateStatus());

    updateStatus();

    return () => {
      events.dispose();
      group.dispose();
    };
  }, [bus, netbus]); // eslint-disable-line

  return {
    status,
  };
}

/**
 * [Helpers]
 */

function ids(peer: t.PeerStatus) {
  return peer.connections.map((conn) => conn.id);
}
