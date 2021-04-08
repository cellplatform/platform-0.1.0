import { useEffect, useState } from 'react';
import { debounceTime } from 'rxjs/operators';

import { rx, t } from '../common';
import { Events } from '../Events';

/**
 * Monitors an event-bus keeping a set of state values
 * synced as peers interact with the network.
 */
export function useLocalPeer(args: { self: t.PeerId; bus: t.EventBus<any> }) {
  const { self } = args;
  const bus = args.bus.type<t.PeerEvent>();

  const [status, setStatus] = useState<t.PeerStatus>();
  const [video, setVideo] = useState<MediaStream>();
  const [screen, setScreen] = useState<MediaStream>();

  useEffect(() => {
    const events = Events({ bus });
    const $ = events.$;
    const media = events.media(self);

    const updateStatus = async () => {
      const { peer } = await events.status(self).get();
      setStatus(peer);
    };

    /**
     * Listen for local peer status changes.
     */
    rx.payload<t.PeerLocalStatusChangedEvent>($, 'Peer:Local/status:changed')
      .pipe(debounceTime(50))
      .subscribe(updateStatus);

    /**
     * Listen for media requests.
     */
    media.response$.pipe().subscribe((e) => {
      if (e.kind === 'screen') setScreen(e.media);
      if (e.kind === 'video') setVideo(e.media);
    });

    return () => events.dispose();
  }, [bus, self]);

  return {
    status,
    media: { video, screen },
  };
}
