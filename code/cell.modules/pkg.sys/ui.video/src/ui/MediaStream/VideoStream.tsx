import React, { useEffect, useRef } from 'react';
import { css, CssValue, t, Style, Color } from './common';

type ClickHandler = React.MouseEventHandler<HTMLDivElement>;

export type VideoStreamProps = {
  stream?: MediaStream;
  width?: number;
  height?: number;
  borderRadius?: t.CssRadiusInput;
  backgroundColor?: string | number;
  isMuted?: boolean;
  style?: CssValue;
  onClick?: ClickHandler;
  onMouseDown?: ClickHandler;
  onMouseUp?: ClickHandler;
  onMouseEnter?: ClickHandler;
  onMouseLeave?: ClickHandler;
};

export const VideoStream: React.FC<VideoStreamProps> = (props) => {
  const { stream, isMuted = false, width = 300, height = 200, borderRadius = 20 } = props;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream, videoRef]);

  const styles = {
    base: css({
      position: 'relative',
      overflow: 'hidden',
      borderRadius: Style.toRadius(borderRadius),
      backgroundColor: Color.format(props.backgroundColor),
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
    <div
      {...css(styles.base, props.style)}
      onClick={props.onClick}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      <video {...styles.video} ref={videoRef} autoPlay={true} muted={isMuted} />
    </div>
  );
};
