import React, { useEffect, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, R, rx, t, VideoStream, useLocalPeer } from './common';

export type DevVideosProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  video: { width: number; height: number; radius: number };
  style?: CssValue;
  onVideoClick?: (e: { media: MediaStream; peer: t.PeerId }) => void;
};

export const DevVideos: React.FC<DevVideosProps> = (props) => {
  const { video } = props;
  const { network } = props.instance;

  type P = { id: string; connections: t.PeerConnectionStatus[] };
  const [peers, setPeers] = useState<P[]>([]);
  const hasPeers = peers.length > 0;

  type Item = { media: MediaStream; peer: t.PeerId };
  const self = useLocalPeer({ bus: network.bus, self: network.self });

  const updatePeers = (connections: t.PeerConnectionStatus[]) => {
    const grouped = R.groupBy(({ peer }) => peer.remote.id, connections);
    const items: P[] = Object.keys(grouped).map((id) => ({ id, connections: grouped[id] }));
    setPeers(items);
  };

  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();
    const status$ = network.status.$.pipe(takeUntil(dispose$));
    status$.subscribe((e) => updatePeers(e.connections));
    updatePeers(network.status.current.connections);
    return dispose;
  }, []); // eslint-disable-line

  /**
   * [Render]
   */
  if (!hasPeers) return null;

  const styles = {
    base: css({ position: 'relative', Flex: 'x-center-center' }),
    item: css({
      marginRight: 6,
      ':last-child': { marginRight: 0 },
    }),
  };

  const remoteStreams: Item[] = peers
    .map((peer) => peer.connections.find((conn) => conn.kind === 'media/video'))
    .filter(Boolean)
    .map((item) => item as t.PeerConnectionMediaStatus)
    .filter((item) => Boolean(item.media))
    .map((item) => {
      return {
        media: item.media as MediaStream,
        peer: item.id,
      };
    });

  const toVideoElement = (item: Item) => {
    const { media, peer } = item;
    return (
      <VideoStream
        key={`video.${peer}`}
        stream={media}
        isMuted={true}
        width={video.width}
        height={video.height}
        borderRadius={video.radius}
        backgroundColor={-0.03}
        style={styles.item}
        onClick={() => props.onVideoClick?.({ media, peer })}
      />
    );
  };

  const elSelfVideo =
    self.media.video && toVideoElement({ media: self.media.video, peer: self.id });
  const elPeerVideos = remoteStreams.map((item) => toVideoElement(item));

  return (
    <div {...css(styles.base, props.style)}>
      {elSelfVideo}
      {elPeerVideos}
    </div>
  );
};
