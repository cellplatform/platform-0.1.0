import { t, rx } from '../common';
import { FileCache } from '../../../cache';

/**
 * Strategy for caching files.
 */
export async function FilesystemCacheStrategy(args: {
  netbus: t.NetBus<t.NetGroupEvent>;
  events: { fs: t.FilesystemEvents; peer: t.PeerNetworkEvents };
  isEnabled: () => boolean;
}) {
  const { netbus, events } = args;
  const fs = events.fs;
  const files$ = fs.add().$;

  let _cache: t.FileCache | undefined;
  const getCache = async () => _cache || (_cache = await FileCache());

  /**
   * TODO 🐷
   * Add
   *  - calculate SHA256 on worker thread
   *  - add to local cache
   *  - determine who does not have it over the network and send
   *
   * Event API:
   *  - list
   *  - request hash from network peers
   */

  /**
   * Listen for new files.
   */
  files$.pipe().subscribe(async (e) => {
    const cache = await getCache();

    await Promise.all(e.files.map((file) => cache.put(file)));

    e.files.forEach((file) => {
      console.log('  > added to cache:', file.filename);
    });
  });
}
