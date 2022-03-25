import React, { useRef } from 'react';

import {
  color,
  css,
  CssValue,
  t,
  useLocalPeer,
  useResizeObserver,
  VideoStream,
} from '../DEV.common';

export type DevVideosGroupLayoutProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
  isSelf?: boolean;
  style?: CssValue;
};

export const DevVideosGroupLayout: React.FC<DevVideosGroupLayoutProps> = (props) => {
  const { bus, netbus } = props;
  const self = netbus.self;

  const resize = useResizeObserver();
  const local = useLocalPeer({ self, bus });

  const videoStreams = local.connections
    .filter((item) => item.kind === 'media/video')
    .map((item) => item as t.PeerConnectionMediaStatus);

  const isEmpty = videoStreams.length === 0;

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
    empty: css({
      Absolute: 0,
      Flex: 'center-center',
      color: color.format(-0.3),
      fontStyle: 'italic',
      fontSize: 14,
      userSelect: 'none',
    }),
  };

  const elVideoPanels =
    resize.ready &&
    !isEmpty &&
    videoStreams.map((item, i) => {
      const isLast = i === videoStreams.length - 1;
      const width = isEmpty ? -1 : resize.rect.width / videoStreams.length;
      return (
        <div key={`${item.uri}`} {...styles.video.base}>
          <VideoStream
            stream={item.media}
            width={width}
            height={resize.rect.height}
            isMuted={true}
            borderRadius={0}
          />
          {!isLast && <div {...styles.video.divider} />}
        </div>
      );
    });

  const elBody = resize.ready && <div {...styles.body}>{elVideoPanels}</div>;

  const elEmpty = isEmpty && local.ready && (
    <div {...styles.empty}>
      <div>No video connections to display.</div>
    </div>
  );

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      {elBody}
      {elEmpty}
    </div>
  );
};
