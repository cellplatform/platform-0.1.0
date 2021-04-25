import { GroupEvents, t } from '../common';
import { GroupConnectionsStrategy } from './strategy.GroupConnections';

/**
 * Handles strategies for working with a group of peers ("mesh" network).
 */
export function GroupStrategy(args: { netbus: t.NetBus<any> }): t.GroupStrategy {
  const { netbus } = args;
  const events = GroupEvents({ netbus });

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
