import { filter } from 'rxjs/operators';

import { t } from '../../common';
import { Events } from '../Events';

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
   * Auto purge connections when closed.
   */
  events
    .connections(self)
    .closed$.pipe(filter((e) => strategy.purgeOnClose))
    .subscribe(() => events.purge(self).fire());

  /**
   * API
   */
  const strategy = {
    dispose$: events.dispose$,
    dispose: events.dispose,
    purgeOnClose: true,
  };

  return strategy;
}
