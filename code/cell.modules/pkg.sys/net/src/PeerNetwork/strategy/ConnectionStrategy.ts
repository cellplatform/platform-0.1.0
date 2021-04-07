import { t } from '../common';
import { Events } from '../Events';
import { autoPerge, ensureClosed } from './ConnectionStrategy.close';
import { autoPropagation } from './ConnectionStrategy.propogate';

/**
 * Handles strategies for connecting and disconnecting peers.
 */
export function ConnectionStrategy(args: {
  self: t.PeerId;
  bus: t.EventBus<any>;
}): t.PeerConnectionStrategy {
  const { self } = args;
  const bus = args.bus.type<t.PeerEvent>();
  const events = Events({ bus });

  /**
   * Initialize sub-strategies.
   */
  autoPerge({ self, events, isEnabled: () => strategy.autoPurgeOnClose });
  ensureClosed({ self, events, isEnabled: () => strategy.ensureClosed });
  autoPropagation({ self, events, isEnabled: () => strategy.autoPropagation });

  /**
   * API
   */
  const strategy = {
    dispose$: events.dispose$,
    dispose: events.dispose,

    autoPurgeOnClose: true,
    autoPropagation: true,
    ensureClosed: true,
  };

  return strategy;
}
