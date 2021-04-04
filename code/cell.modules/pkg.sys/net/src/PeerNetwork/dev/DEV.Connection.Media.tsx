import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, PropList, PropListItem, useVideoStreamState } from './common';
import { DevVideo } from './DEV.Media.Video';

import { Waveform } from 'sys.ui.video/lib/components/VideoStream/dev/DEV.waveform';
import { DevMedia } from './DEV.Media';

export type ConnectionMediaProps = {
  bus: t.EventBus<any>;
  connection: t.PeerConnectionMediaStatus;
  style?: CssValue;
};

export const ConnectionMedia: React.FC<ConnectionMediaProps> = (props) => {
  const { connection } = props;
  const bus = props.bus.type<t.PeerEvent>();

  const peerId = connection.id.remote;
  const streamRef = DevMedia.videoRef(peerId);

  const styles = {
    base: css({
      position: 'relative',
    }),
    video: css({
      Flex: 'vertical-center-center',
    }),
  };

  const items: PropListItem[] = [
    { label: 'muted', value: { data: true, kind: 'Switch' } },
    { label: 'foo', value: 123 },
    { label: 'foo', value: 123 },
  ];

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.video}>
        <DevVideo bus={bus} peerId={peerId} />
      </div>
      <PropList items={items} />

      <Waveform bus={bus} streamRef={streamRef} width={240} height={30} />
    </div>
  );
};
