import { t } from '../common';
import { Events } from '../Event';
import { groupConnections } from './GroupStrategy.connections';

/**
 * Handles strategies for working with a group of peers ("mesh" network).
 */
export function GroupStrategy(args: { self: t.PeerId; bus: t.EventBus<any> }): t.PeerGroupStrategy {
  const { self } = args;
  const bus = args.bus.type<t.PeerEvent>();
  const events = Events(bus);

  /**
   * Initialize sub-strategies.
   */
  groupConnections({ self, events, isEnabled: () => strategy.connections });

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
