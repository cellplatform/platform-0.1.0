import React, { useEffect, useState } from 'react';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, R, rx, t, VideoStream } from './DEV.common';

export type DevVideosProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  video: { width: number; height: number; radius: number };
  style?: CssValue;
};

export const DevVideos: React.FC<DevVideosProps> = (props) => {
  const { video } = props;
  const { network } = props.instance;

  type P = { id: string; connections: t.PeerConnectionStatus[] };
  const [peers, setPeers] = useState<P[]>([]);
  const hasPeers = peers.length > 0;

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

  const remoteStreams = peers
    .map((peer) => peer.connections.find((conn) => conn.kind === 'media/video'))
    .filter(Boolean)
    .map((item) => item as t.PeerConnectionMediaStatus)
    .map((item) => item.media)
    .filter(Boolean);

  const elVideos = remoteStreams.map((media, i) => {
    return (
      <VideoStream
        key={i}
        stream={media}
        isMuted={true}
        width={video.width}
        height={video.height}
        borderRadius={video.radius}
        backgroundColor={-0.03}
        style={styles.item}
      />
    );
  });

  return <div {...css(styles.base, props.style)}>{elVideos}</div>;
};
