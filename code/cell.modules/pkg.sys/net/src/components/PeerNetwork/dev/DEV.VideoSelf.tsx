import React, { useEffect } from 'react';
import {
  color,
  css,
  CssValue,
  t,
  VideoStream,
  useVideoStreamState,
  MediaEvent,
  MediaStreamController,
} from './common';

export type VideoSelfProps = {
  networkRef: string;
  bus: t.EventBus<any>;

  style?: CssValue;
  width?: number;
  height?: number;
};

export const VideoSelf: React.FC<VideoSelfProps> = (props) => {
  const { width = 150, height = 100 } = props;

  const ref = props.networkRef;
  const bus = props.bus.type<t.PeerEvent | MediaEvent>();

  const { stream } = useVideoStreamState({
    ref,
    bus,
    onChange: (stream) => {
      // bus.fire({ type: 'Peer/Network/self', payload: { ref, video: stream } });
    },
  });

  useEffect(() => {
    MediaStreamController({ bus });

    bus.fire({ type: 'MediaStream/start:video', payload: { ref } });
  }, [bus, ref]);

  const styles = {
    base: css({
      backgroundColor: color.format(-0.02),
      border: `solid 1px ${color.format(-0.03)}`,
      borderRadius: 20,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <VideoStream stream={stream} width={width} height={height} isMuted={true} />
    </div>
  );
};
