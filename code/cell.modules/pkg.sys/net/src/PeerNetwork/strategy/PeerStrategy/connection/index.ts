import { t, Events } from '../../common';
import { AutoPergeStrategy } from './strategy.AutoPerge';
import { EnsureClosedStrategy } from './strategy.EnsureClosed';

/**
 * Handles strategies for connecting and disconnecting peers.
 */
export function PeerConnectionStrategy(args: {
  bus: t.EventBus<any>;
  netbus: t.PeerNetworkBus<any>;
}): t.PeerConnectionStrategy {
  const { netbus } = args;
  const bus = args.bus as t.EventBus<t.PeerEvent>;
  const events = Events(bus);
  const { dispose, dispose$ } = events;

  /**
   * Initialize sub-strategies.
   */
  AutoPergeStrategy({ netbus, events, isEnabled: () => strategy.autoPurgeOnClose });
  EnsureClosedStrategy({ netbus, events, isEnabled: () => strategy.ensureClosed });

  /**
   * API
   */
  const strategy = {
    dispose$,
    dispose,

    // Enabled state.
    autoPurgeOnClose: true,
    ensureClosed: true,
  };

  return strategy;
}
