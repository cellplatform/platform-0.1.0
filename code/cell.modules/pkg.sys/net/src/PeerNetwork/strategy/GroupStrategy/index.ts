import { Events, GroupEvents, t } from '../common';
import { GroupConnectionsStrategy } from './strategy.GroupConnections';

/**
 * Handles strategies for working with a group of peers ("mesh" network).
 */
export function GroupStrategy(args: {
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
}): t.GroupStrategy {
  const { netbus } = args;
  const events = {
    peer: Events(args.bus),
    group: GroupEvents(netbus),
  };

  /**
   * Initialize sub-strategies.
   */
  GroupConnectionsStrategy({ netbus, events, isEnabled: () => strategy.connections });

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
