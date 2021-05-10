import React, { useRef } from 'react';

import {
  AudioWaveform,
  color,
  css,
  CssValue,
  t,
  useResizeObserver,
  VideoStream,
  isLocalhost,
  COLORS,
} from '../common';
import { DevModal } from '../layouts';

import { RecordButton, useRecordController } from 'sys.ui.video/lib/components/RecordButton';

export type DevVideoFullscreenProps = {
  bus: t.EventBus<any>;
  stream?: MediaStream;
  waveform?: boolean;
  style?: CssValue;
};

export const DevVideoFullscreen: React.FC<DevVideoFullscreenProps> = (props) => {
  const { stream } = props;
  const bus = props.bus.type<t.DevEvent>();

  const mainRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(mainRef);
  const { width, height } = resize.rect;

  const styles = {
    base: css({ Absolute: 0, display: 'flex' }),
    body: css({
      flex: 1,
      position: 'relative',
      Flex: 'vertical-stretch-stretch',
      backgroundColor: COLORS.WHITE,
    }),
    main: {
      base: css({ flex: 1, position: 'relative' }),
    },
    footer: {
      base: css({
        position: 'relative',
        Flex: 'horizontal-spaceBetween-center',
        backgroundColor: color.format(1),
        height: 66,
      }),
    },
    waveform: css({ Absolute: [null, 0, 10, 0] }),
  };

  const elVideo = resize.ready && stream && (
    <VideoStream
      stream={stream}
      width={width}
      height={height}
      isMuted={isLocalhost ? true : false}
      borderRadius={0}
    />
  );

  const elWaveform = resize.ready && stream && props.waveform && (
    <AudioWaveform stream={stream} width={width} height={120} style={styles.waveform} />
  );

  const elMain = (
    <div {...styles.main.base} ref={mainRef}>
      {elVideo}
      {elWaveform}
    </div>
  );

  const elFooter = (
    <div {...styles.footer.base}>
      <div />
      <RecordButton bus={bus} stream={stream} size={45} state={'recording'} />
      <div />
    </div>
  );

  return (
    <DevModal bus={bus} style={css(styles.base, props.style)}>
      <div {...styles.body}>
        {elMain}
        {elFooter}
      </div>
    </DevModal>
  );
};
