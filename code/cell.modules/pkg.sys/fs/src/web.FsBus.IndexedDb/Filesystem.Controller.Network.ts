import { t } from './common';

/**
 * Controller for distributing an [Filesystem:IndexedDB] across
 * a peer-to-peer network.
 */
export function NetworkController(args: { events: t.SysFsEvents; netbus: t.NetworkBus<any> }) {
  const { events } = args;
  //

  /**
   * TODO 🐷 WIP
   */
  console.log('network');
  console.log('events.id', events.id);

  events.$.subscribe((e) => {
    console.log('$ NetworkController:', e);
  });

  // Finish up.
  return {};
}
