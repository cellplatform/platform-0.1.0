import { Events, GroupEvents, t } from '../common';
import { FilesystemCacheStrategy } from './strategy.Cache';

/**
 * Handles strategies for working with network files.
 */
export function FilesystemStrategy(args: {
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
}): t.FilesystemStrategy {
  const { netbus } = args;
  const events = {
    peer: Events(args.bus),
    group: GroupEvents(netbus),
  };

  /**
   * Initialize sub-strategies.
   */
  FilesystemCacheStrategy({ netbus, events, isEnabled: () => strategy.cache });

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
    cache: true,
  };

  return strategy;
}
