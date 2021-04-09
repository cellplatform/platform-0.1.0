import React, { useEffect, useRef, useState } from 'react';

import {
  AudioWaveform,
  Button,
  color,
  css,
  CssValue,
  Icons,
  t,
  useResizeObserver,
  VideoStream,
} from './common';

export type DevVideoFullscreenProps = {
  bus: t.EventBus<any>;
  stream?: MediaStream;
  style?: CssValue;
};

export const DevVideoFullscreen: React.FC<DevVideoFullscreenProps> = (props) => {
  const { stream } = props;
  const bus = props.bus.type<t.DevEvent>();

  const rootRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef);
  const { width, height } = resize.rect;

  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: color.format(1),
    }),
    waveform: css({ Absolute: [null, 0, 10, 0] }),
    close: css({ Absolute: [5, 5, null, null] }),
  };

  const elClose = (
    <Button style={styles.close}>
      <Icons.Close
        size={32}
        onClick={() => bus.fire({ type: 'DEV/media/fullscreen', payload: { stream: undefined } })}
      />
    </Button>
  );

  const elVideo = resize.ready && stream && (
    <VideoStream stream={stream} width={width} height={height} isMuted={true} borderRadius={0} />
  );

  const elWaveform = resize.ready && stream && (
    <AudioWaveform stream={stream} width={width} height={120} style={styles.waveform} />
  );

  return (
    <div {...css(styles.base, props.style)} ref={rootRef}>
      {elVideo}
      {elWaveform}
      {elClose}
    </div>
  );
};
