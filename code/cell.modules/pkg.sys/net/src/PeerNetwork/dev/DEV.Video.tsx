import { defaultValue } from '@platform/util.value';
import React, { useState } from 'react';

import {
  AudioWaveform,
  color,
  css,
  CssValue,
  Icons,
  PropList,
  PropListItem,
  VideoStream,
  MediaStream,
  t,
} from './common';

export type DevVideoProps = {
  kind: t.PeerConnectionKindMedia;
  stream?: MediaStream;
  width?: number;
  height?: number;
  style?: CssValue;
  isVideoMuted?: boolean;
};

export const DevVideo: React.FC<DevVideoProps> = (props) => {
  const { width = 150, height = 100, stream, kind } = props;
  const isVideo = kind === 'media/video';
  const wifi = MediaStream.useOfflineState();

  const [isAudioTrackMuted, setAudioTrackMuted] = useState<boolean>(false);
  const [isVideoMuted, setVideoMuted] = useState<boolean>(defaultValue(props.isVideoMuted, true));

  const toggleVideoMuted = () => setVideoMuted((prev) => !prev);

  // HACK: Ensure audio tracks are in sync with mic-muted state.
  //       NB: This should be done at a global state level (via events).
  if (stream) {
    const audio = stream.getAudioTracks();
    audio.forEach((track) => (track.enabled = !isAudioTrackMuted));
  }

  const MARGIN = { waveform: 10 };

  const styles = {
    base: css({
      boxSizing: 'border-box',
      position: 'relative',
    }),
    video: {
      base: css({
        backgroundColor: color.format(-0.02),
        border: `solid 1px ${color.format(-0.03)}`,
        borderRadius: 20,
        position: 'relative',
        width,
        height,
        marginBottom: 4,
      }),
      stream: css({
        Absolute: [0, null, null, 0],
        opacity: wifi.offline ? 0.12 : 1,
      }),
      overlay: css({
        Absolute: 0,
        pointerEvents: 'none',
        Flex: 'horizontal-center-center',
      }),
    },
    waveform: {
      base: css({ MarginX: MARGIN.waveform }),
    },
  };

  const elVideoOverlay = wifi.offline && (
    <div {...styles.video.overlay}>
      <Icons.Wifi.Off />
    </div>
  );

  const items: PropListItem[] = [
    {
      label: 'muted',
      value: { data: isVideoMuted, kind: 'Switch', onClick: toggleVideoMuted },
    },
  ];

  const tooltip = stream ? `stream.id: ${stream.id}` : `Stream not loaded`;

  const elWaveform = isVideo && (
    <div {...styles.waveform.base}>
      <AudioWaveform stream={stream} width={width - MARGIN.waveform * 2} height={15} />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.video.base} title={tooltip}>
        <VideoStream
          stream={stream}
          width={width}
          height={height}
          isMuted={isVideo ? isVideoMuted : true}
          style={styles.video.stream}
        />
        {elVideoOverlay}
      </div>
      {isVideo && <PropList items={items} />}
      {elWaveform}
    </div>
  );
};
