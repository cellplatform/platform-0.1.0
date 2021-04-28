import { t, rx } from '../common';

/**
 * Strategy for caching files.
 */
export async function FilesystemCacheStrategy(args: {
  netbus: t.NetBus<t.GroupEvent>;
  events: { group: t.GroupEvents; peer: t.PeerNetworkEvents };
  isEnabled: () => boolean;
}) {
  const { netbus, events } = args;
  const fs = events.group.fs();

  /**
   * Listen for new files.
   */
  fs.files$.pipe().subscribe((e) => {
    /**
     * TODO 🐷
     * - cache file
     * - calculate SHA256 hash before firing event
     */
    console.log('strategy/files', e);
  });
}
