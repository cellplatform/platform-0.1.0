import { Events, FilesystemEvents, t } from '../common';
import { FilesystemCacheStrategy } from './strategy.FilesystemCache';

/**
 * Handles strategies for working with network files.
 */
export function FilesystemStrategy(args: {
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
}): t.FilesystemStrategy {
  const { netbus } = args;
  const events = {
    peer: Events(args.bus),
    fs: FilesystemEvents(netbus),
  };

  /**
   * Initialize sub-strategies.
   */
  FilesystemCacheStrategy({ netbus, events, isEnabled: () => strategy.cache });

  /**
   * API
   */
  const strategy = {
    dispose$: events.fs.dispose$,
    dispose() {
      events.fs.dispose();
      events.peer.dispose();
    },

    // Enabled state.
    cache: true,
  };

  return strategy;
}
