import { filter } from 'rxjs/operators';
import { t } from '../common';

/**
 * Strategy for auto-purging connections when closed
 */
export function autoPerge(args: {
  self: t.PeerId;
  events: t.PeerNetworkEvents;
  isEnabled: () => boolean;
}) {
  const { self, events } = args;
  const connections = events.connections(self);

  /**
   * Auto purge connections when closed.
   */
  connections.closed$
    .pipe(
      filter((e) => e.self === self),
      filter(() => args.isEnabled()),
    )
    .subscribe((e) => events.purge(self).fire());
}
