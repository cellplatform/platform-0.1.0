import { GroupEvents, t } from '../common';
import { GroupConnectionsStrategy } from './strategy.GroupConnections';

/**
 * Handles strategies for working with a group of peers ("mesh" network).
 */
export function GroupStrategy(args: { self: t.PeerId; netbus: t.NetBus<any> }): t.GroupStrategy {
  const { self, netbus } = args;
  const events = GroupEvents({ self, netbus });

  /**
   * Initialize sub-strategies.
   */
  GroupConnectionsStrategy({ netbus, events, isEnabled: () => strategy.connections });

  /**
   * API
   */
  const strategy = {
    dispose$: events.dispose$,
    dispose: events.dispose,

    // Enabled state.
    connections: true,
  };

  return strategy;
}
