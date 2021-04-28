import { Events, GroupEvents, t } from '../common';
import { GroupConnectionsStrategy } from './strategy.GroupConnections';
import { GroupFilesystemStrategy } from './strategy.GroupFilesystem';

/**
 * Handles strategies for working with a group of peers ("mesh" network).
 */
export function GroupStrategy(args: {
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
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
  GroupFilesystemStrategy({ netbus, events, isEnabled: () => strategy.filesystem });

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
    filesystem: true,
  };

  return strategy;
}
