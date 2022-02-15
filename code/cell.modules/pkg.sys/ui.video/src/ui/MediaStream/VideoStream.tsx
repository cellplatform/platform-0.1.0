import React, { useEffect, useRef } from 'react';
import { css, CssValue, defaultValue, t, Style } from '../../common';

export type VideoStreamProps = {
  stream?: MediaStream;
  width?: number;
  height?: number;
  borderRadius?: t.CssRadiusInput;
  isMuted?: boolean;
  style?: CssValue;
};

export const VideoStream: React.FC<VideoStreamProps> = (props) => {
  const { stream, isMuted = false, width = 300, height = 200, borderRadius = 30 } = props;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream, videoRef]);

  const styles = {
    base: css({
      position: 'relative',
      overflow: 'hidden',
      borderRadius: Style.toRadius(borderRadius),
      width,
      height,
    }),
    video: css({
      display: stream?.active ? 'block' : 'none',
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
