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
} from './common';
import { DevMedia } from './DEV.Media';

export type DevVideoProps = {
  peer: t.PeerId;
  bus: t.EventBus<any>;
  width?: number;
  height?: number;
  style?: CssValue;
};

export const DevVideo: React.FC<DevVideoProps> = (props) => {
  const { width = 150, height = 100 } = props;
  const wifi = useOfflineState();

  const ref = DevMedia.videoRef(props.peer);
  const bus = props.bus.type<t.PeerEvent | MediaEvent>();

  const { stream } = useVideoStreamState({
    ref,
    bus,
    onChange: (stream) => {
      // bus.fire({ type: 'Peer:Local/self', payload: { ref, video: stream } });
    },
  });

  useEffect(() => {
    MediaStreamController({ bus });
    const events = MediaStreamEvents({ bus });
    events.start(ref).video();
    return () => events.dispose();
  }, [bus, ref]);

  const styles = {
    base: css({
      position: 'relative',
      backgroundColor: color.format(-0.02),
      border: `solid 1px ${color.format(-0.03)}`,
      borderRadius: 20,
      width,
      height,
    }),
    video: css({
      Absolute: [0, null, null, 0],
      opacity: wifi.offline ? 0.12 : 1,
    }),
    overlay: css({
      Absolute: 0,
      pointerEvents: 'none',
      Flex: 'horizontal-center-center',
    }),
  };

  const elOverlay = wifi.offline && (
    <div {...styles.overlay}>
      <Icons.Wifi.Off />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <VideoStream
        stream={stream}
        width={width}
        height={height}
        isMuted={true}
        style={styles.video}
      />
      {elOverlay}
    </div>
  );
};
