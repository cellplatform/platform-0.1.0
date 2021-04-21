import { useEffect, useState } from 'react';
import { debounceTime } from 'rxjs/operators';

import { t } from '../common';
import { Events } from '../Events';
import { StreamUtil } from '../util';

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
    const media = events.media(self);

    const setMedia = (kind: t.PeerConnectionKindMedia, media?: MediaStream) => {
      if (kind === 'media/video') setVideo(media);
      if (kind === 'media/screen') setScreen(media);
    };

    const updateStatus = async () => {
      const { peer } = await events.status(self).get();
      setStatus(peer);
    };

    /**
     * Listen for local peer status changes.
     */
    events.status(self).changed$.pipe(debounceTime(50)).subscribe(updateStatus);

    /**
     * Listen for media requests.
     */
    media.response$.pipe().subscribe((e) => {
      setMedia(e.kind, e.media);
      if (e.media) StreamUtil.onEnded(e.media, () => setMedia(e.kind, undefined));
    });

    if (status === undefined) updateStatus();

    return () => events.dispose();
  }, [bus, self]); // eslint-disable-line

  return {
    status,
    media: { video, screen },
  };
}
