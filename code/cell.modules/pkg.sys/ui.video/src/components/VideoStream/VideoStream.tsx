import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, defaultValue, rx, t } from '../../common';

export type VideoStreamProps = {
  id: string;
  bus: t.EventBus<any>;
  stream?: MediaStream;
  width?: number;
  height?: number;
  isMuted?: boolean;
  borderRadius?: number;
  style?: CssValue;
};

export const VideoStream: React.FC<VideoStreamProps> = (props) => {
  const { stream } = props;
  const videoRef = useRef<HTMLVideoElement>(null);

  const isMuted = defaultValue(props.isMuted, false);
  const width = defaultValue(props.width, 300);
  const height = defaultValue(props.height, 200);
  const borderRadius = defaultValue(props.borderRadius, 16);

  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, [stream, videoRef]);

  const styles = {
    base: css({
      position: 'relative',
      overflow: 'hidden',
      borderRadius,
      width,
      height,
    }),
    video: css({
      objectFit: 'cover',
      width: '100%',
      height: '100%',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <video {...styles.video} ref={videoRef} autoPlay={true} muted={isMuted} />
    </div>
  );
};
