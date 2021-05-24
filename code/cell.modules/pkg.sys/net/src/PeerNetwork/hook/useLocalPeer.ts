import { useEffect, useState } from 'react';
import { filter, debounceTime, takeUntil } from 'rxjs/operators';

import { t, StreamUtil } from '../common';
import { PeerEvents } from '../event';

/**
 * Monitors an event-bus keeping a set of state values
 * synced as peers interact with the network.
 */
export function useLocalPeer(args: { self: t.PeerId; bus: t.EventBus<any> }) {
  const { self } = args;
  const bus = args.bus as t.EventBus<t.PeerEvent>;

  const [status, setStatus] = useState<t.PeerStatus>();
  const [video, setVideo] = useState<MediaStream>();
  const [screen, setScreen] = useState<MediaStream>();

  useEffect(() => {
    const events = PeerEvents(bus);
    const media = events.media(self);
    const dispose$ = events.dispose$;

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
    events
      .status(self)
      .changed$.pipe(debounceTime(50), takeUntil(dispose$))
      .subscribe(updateStatus);

    /**
     * Listen for media requests.
     */
    media.res$.pipe(takeUntil(dispose$)).subscribe((e) => {
      setMedia(e.kind, e.media);
      if (e.media) StreamUtil.onEnded(e.media, () => setMedia(e.kind, undefined));
    });

    if (status === undefined) updateStatus();

    return () => {
      events.dispose();
    };
  }, [bus, self]); // eslint-disable-line

  return {
    status,
    connections: status?.connections || [],
    media: { video, screen },
  };
}
