import { t, Events } from '../../common';
import { AutoPergeStrategy } from './strategy.AutoPerge';
import { EnsureClosedStrategy } from './strategy.EnsureClosed';
import { AutoPropagationStrategy } from './strategy.AutoPropagation';

/**
 * Handles strategies for connecting and disconnecting peers.
 */
export function PeerConnectionStrategy(args: {
  self: t.PeerId;
  bus: t.EventBus<any>;
}): t.PeerConnectionStrategy {
  const { self } = args;
  const bus = args.bus.type<t.PeerEvent>();
  const events = Events(bus);

  /**
   * Initialize sub-strategies.
   */
  AutoPergeStrategy({ self, events, isEnabled: () => strategy.autoPurgeOnClose });
  EnsureClosedStrategy({ self, events, isEnabled: () => strategy.ensureClosed });
  AutoPropagationStrategy({ self, events, isEnabled: () => strategy.autoPropagation });

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
