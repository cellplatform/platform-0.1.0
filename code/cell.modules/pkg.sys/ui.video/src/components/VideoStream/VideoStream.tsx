import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | undefined>(props.stream);

  const { id } = props;
  const bus = props.bus.type<t.VideoEvent>();
  const isMuted = defaultValue(props.isMuted, false);
  const width = defaultValue(props.width, 300);
  const height = defaultValue(props.height, 200);
  const borderRadius = defaultValue(props.borderRadius, 16);

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.event$.pipe(takeUntil(dispose$));

    rx.payload<t.VideoStreamMediaEvent>($, 'VideoStream/media')
      .pipe(filter((e) => e.ref === id))
      .subscribe((e) => setStream(e.stream));

    return () => dispose$.next();
  }, [bus, id]);

  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

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
