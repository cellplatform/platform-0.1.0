import { debounceTime, filter } from 'rxjs/operators';

import { t } from '../../common';

/**
 * Strategy for auto-purging connections when closed.
 */
export function AutoPergeStrategy(args: {
  self: t.PeerId;
  events: t.PeerNetworkEvents;
  isEnabled: () => boolean;
}) {
  const { self, events } = args;
  const connections = events.connections(self);

  connections.disconnect.res$
    .pipe(
      filter((e) => e.self === self),
      filter(() => args.isEnabled()),
      debounceTime(10),
    )
    .subscribe((e) => events.purge(self).fire());
}
