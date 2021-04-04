import React, { useEffect } from 'react';

import {
  color,
  css,
  CssValue,
  Icons,
  MediaEvent,
  MediaStreamController,
  MediaStreamEvents,
  t,
  useOfflineState,
  useVideoStreamState,
  VideoStream,
  PropList,
  PropListItem,
  AudioWaveform,
} from './common';
import { DevMedia } from './DEV.Media';

export type DevVideoProps = {
  peerId: t.PeerId;
  bus: t.EventBus<any>;
  width?: number;
  height?: number;
  style?: CssValue;
};

export const DevVideo: React.FC<DevVideoProps> = (props) => {
  const { width = 150, height = 100 } = props;
  const wifi = useOfflineState();

  const peerId = props.peerId;
  const videoRef = DevMedia.videoRef(peerId);
  const bus = props.bus.type<t.PeerEvent | MediaEvent>();

  const { stream } = useVideoStreamState({
    ref: videoRef,
    bus,
    onChange: (stream) => {
      //
    },
  });

  useEffect(() => {
    MediaStreamController({ bus });
    const events = MediaStreamEvents({ bus });
    events.start(videoRef).video();
    return () => events.dispose();
  }, [bus, videoRef]);

  const margin = {
    waveform: 18,
  };

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
      base: css({ MarginX: margin.waveform }),
    },
  };

  const elVideoOverlay = wifi.offline && (
    <div {...styles.video.overlay}>
      <Icons.Wifi.Off />
    </div>
  );

  const items: PropListItem[] = [{ label: 'microphone', value: { data: true, kind: 'Switch' } }];

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.video.base}>
        <VideoStream
          stream={stream}
          width={width}
          height={height}
          isMuted={true}
          style={styles.video}
        />
        {elVideoOverlay}
      </div>
      <div {...styles.waveform.base}>
        <AudioWaveform
          bus={bus}
          streamRef={videoRef}
          width={width - margin.waveform * 2}
          height={15}
        />
      </div>
      <PropList items={items} />
    </div>
  );
};
