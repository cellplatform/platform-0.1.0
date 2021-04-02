import { t } from '../../common';
import { Events } from '../Events';
import { ConnectionStrategy } from './Strategy.Connection';

/**
 * Single combined set of network strategies.
 */
export function Strategy(args: { self: t.PeerId; bus: t.EventBus<any> }): t.PeerStrategy {
  const bus = args.bus.type<t.PeerEvent>();
  const events = Events({ bus });
  const connection = ConnectionStrategy(args);

  return {
    connection,

    dispose$: events.dispose$,
    dispose() {
      events.dispose();
      connection.dispose();
    },
  };
}
