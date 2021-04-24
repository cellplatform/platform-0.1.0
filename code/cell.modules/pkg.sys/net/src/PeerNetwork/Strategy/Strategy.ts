import { t } from '../common';
import { Events } from '../Events';
import { ConnectionStrategy } from './ConnectionStrategy';
import { GroupStrategy } from './GroupStrategy';

/**
 * Single combined set of network strategies.
 */
export function Strategy(args: { self: t.PeerId; bus: t.EventBus<any> }): t.PeerStrategy {
  const bus = args.bus.type<t.PeerEvent>();
  const events = Events(bus);

  const connection = ConnectionStrategy(args);
  const group = GroupStrategy(args);

  return {
    connection,
    group,

    dispose$: events.dispose$,
    dispose() {
      events.dispose();
      connection.dispose();
      group.dispose();
    },
  };
}
