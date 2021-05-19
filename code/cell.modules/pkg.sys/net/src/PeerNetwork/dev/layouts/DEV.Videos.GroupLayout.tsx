import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, useResizeObserver, VideoStream, isLocalhost } from '../common';
import { useLocalPeer } from '../../hook';

export type DevVideosGroupLayoutProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerBus<any>;
  isSelf?: boolean;
  style?: CssValue;
};

export const DevVideosGroupLayout: React.FC<DevVideosGroupLayoutProps> = (props) => {
  const { bus, netbus } = props;
  const self = netbus.self;

  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef);
  const local = useLocalPeer({ self, bus });

  const videoStreams = local.connections
    .filter((item) => item.kind === 'media/video')
    .map((item) => item as t.PeerConnectionMediaStatus);
  const videoPanelWidth = videoStreams.length === 0 ? -1 : resize.rect.width / videoStreams.length;

  console.log('videoStreams', videoStreams);

  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: color.format(1),
    }),
    body: css({ Absolute: 0, Flex: 'horizontal-stretch-stretch' }),
    video: {
      base: css({ position: 'relative', display: 'flex', flex: 1 }),
      divider: css({
        Absolute: [0, 0, 0, null],
        width: 10,
        backgroundColor: color.format(0.3),
        backdropFilter: 'blur(5px)',
      }),
    },
  };

  const elVideoPanels =
    resize.ready &&
    videoStreams.map((item, i) => {
      const isLast = i === videoStreams.length - 1;
      return (
        <div key={`${item.uri}`} {...styles.video.base}>
          <VideoStream
            stream={item.media}
            width={videoPanelWidth}
            height={resize.rect.height}
            isMuted={isLocalhost ?? false}
            borderRadius={0}
          />
          {!isLast && <div {...styles.video.divider} />}
        </div>
      );
    });

  const elBody = resize.ready && <div {...styles.body}>{elVideoPanels}</div>;

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elBody}
    </div>
  );
};
