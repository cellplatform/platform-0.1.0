import { t, Events } from '../../common';
import { AutoPergeStrategy } from './strategy.AutoPerge';
import { EnsureClosedStrategy } from './strategy.EnsureClosed';
import { AutoPropagationStrategy } from './strategy.AutoPropagation';

/**
 * Handles strategies for connecting and disconnecting peers.
 */
export function PeerConnectionStrategy(args: {
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
}): t.PeerConnectionStrategy {
  const { netbus } = args;
  const bus = args.bus.type<t.PeerEvent>();
  const events = Events(bus);

  /**
   * Initialize sub-strategies.
   */
  AutoPergeStrategy({ netbus, events, isEnabled: () => strategy.autoPurgeOnClose });
  EnsureClosedStrategy({ netbus, events, isEnabled: () => strategy.ensureClosed });
  AutoPropagationStrategy({ netbus, events, isEnabled: () => strategy.autoPropagation });

  /**
   * API
   */
  const strategy = {
    dispose$: events.dispose$,
    dispose: events.dispose,

    // Enabled state.
    autoPurgeOnClose: true,
    autoPropagation: true,
    ensureClosed: true,
  };

  return strategy;
}
