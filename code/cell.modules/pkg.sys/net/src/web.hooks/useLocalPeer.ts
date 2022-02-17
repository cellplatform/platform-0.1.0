import { useEffect, useState } from 'react';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { t, MediaStreamUtil, rx } from '../common';
import { PeerEvents } from '../web.PeerNetwork.events';

export type UseLocalPeer = {
  id: t.PeerId;
  ready: boolean;
  status?: t.PeerStatus;
  media: { video?: MediaStream; screen?: MediaStream };
  connections: t.PeerConnectionStatus[];
};

/**
 * Monitors an event-bus keeping a set of state values
 * synced as peers interact with the network.
 */
export function useLocalPeer(args: {
  bus: t.EventBus<any>;
  self: t.PeerId;
  onChange?: (e: UseLocalPeer) => void;
}): UseLocalPeer {
  const { self, onChange } = args;
  const bus = rx.busAsType<t.PeerEvent>(args.bus);
  const id = self;

  const [ready, setReady] = useState(false);
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
      const res = await events.status(self).get();
      setStatus(res.peer);
      setReady(true);
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
      if (e.media) MediaStreamUtil.onEnded(e.media, () => setMedia(e.kind, undefined));
    });

    if (status === undefined) updateStatus();

    return () => events.dispose();
  }, [bus, self]); // eslint-disable-line

  /**
   * Callback handler.
   */
  useEffect(() => {
    if (onChange) {
      const media = { video, screen };
      const connections = status?.connections ?? [];
      onChange({ id, ready, status, media, connections });
    }
  }, [id, ready, status, video, screen, onChange]);

  return {
    id,
    ready,
    status,
    media: { video, screen },
    connections: status?.connections || [],
  };
}
