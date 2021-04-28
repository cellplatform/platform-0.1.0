import { t, rx } from '../common';

/**
 * Strategy for managing files shared amoung a group of peers.
 */
export async function GroupFilesystemStrategy(args: {
  netbus: t.NetBus<t.GroupEvent>;
  events: { group: t.GroupEvents; peer: t.PeerNetworkEvents };
  isEnabled: () => boolean;
}) {
  const { netbus, events } = args;
  const fs = events.group.fs();

  /**
   * Listen for new files.
   */
  rx.payload<t.GroupFsFilesEvent>(fs.files$, 'sys.net/group/fs/files')
    .pipe()
    .subscribe((e) => {
      /**
       * TODO 🐷
       * - cache file
       * - calculate SHA256 hash before firing event
       */
      console.log('strategy/files', e);
    });
}
