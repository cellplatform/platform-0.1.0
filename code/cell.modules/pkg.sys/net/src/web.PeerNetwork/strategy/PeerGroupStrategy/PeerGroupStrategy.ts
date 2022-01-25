import { PeerEvents, GroupEvents, t } from '../common';
import { PeerGroupConnectionsStrategy } from './PeerGroupConnectionsStrategy';

/**
 * Handles strategies for working with a group of peers ("mesh" network).
 */
export function PeerGroupStrategy(args: {
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
}): t.GroupStrategy {
  const { netbus } = args;
  const events = {
    peer: PeerEvents(args.bus),
    group: GroupEvents(netbus),
  };

  /**
   * Initialize sub-strategies.
   */
  PeerGroupConnectionsStrategy({ netbus, events, isEnabled: () => strategy.connections });

  /**
   * API
   */
  const strategy = {
    dispose$: events.group.dispose$,
    dispose() {
      events.group.dispose();
      events.peer.dispose();
    },

    // Enabled state.
    connections: true,
  };

  return strategy;
}
