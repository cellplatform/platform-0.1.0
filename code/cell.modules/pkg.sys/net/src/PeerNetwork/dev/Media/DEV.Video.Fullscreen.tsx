import React, { useRef } from 'react';

import { AudioWaveform, color, css, CssValue, t, useResizeObserver, VideoStream } from '../common';
import { DevModal } from '../DEV.Modal';

export type DevVideoFullscreenProps = {
  bus: t.EventBus<any>;
  stream?: MediaStream;
  waveform?: boolean;
  style?: CssValue;
};

export const DevVideoFullscreen: React.FC<DevVideoFullscreenProps> = (props) => {
  const { stream } = props;
  const bus = props.bus.type<t.DevEvent>();

  const rootRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef);
  const { width, height } = resize.rect;

  const styles = {
    base: css({ Absolute: 0, backgroundColor: color.format(1) }),
    waveform: css({ Absolute: [null, 0, 10, 0] }),
  };

  const elVideo = resize.ready && stream && (
    <VideoStream stream={stream} width={width} height={height} isMuted={true} borderRadius={0} />
  );

  const elWaveform = resize.ready && stream && props.waveform && (
    <AudioWaveform stream={stream} width={width} height={120} style={styles.waveform} />
  );

  return (
    <div {...css(styles.base, props.style)} ref={rootRef}>
      <DevModal bus={bus}>
        {elVideo}
        {elWaveform}
      </DevModal>
    </div>
  );
};
