import React, { useRef } from 'react';
import { RecordButton, useRecordController } from 'sys.ui.video/lib/components/RecordButton';

import { COLORS, css, CssValue, isLocalhost, t, useResizeObserver, VideoStream } from '../common';
import { DevModal } from '../layouts';

export type DevVideoFullscreenProps = {
  bus: t.EventBus<any>;
  stream?: MediaStream;
  style?: CssValue;
};

export const DevVideoFullscreen: React.FC<DevVideoFullscreenProps> = (props) => {
  const { stream } = props;
  const bus = props.bus.type<t.DevEvent>();

  const mainRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(mainRef);
  const { width, height } = resize.rect;

  const record = useRecordController({ bus, stream });

  const styles = {
    base: css({ Absolute: 0, backgroundColor: COLORS.WHITE }),
    main: css({ Absolute: 0 }),
    footer: css({
      Absolute: [null, 0, 0, 0],
      height: 66,
      Flex: 'horizontal-spaceBetween-center',
    }),
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

  const elMain = (
    <div {...styles.main} ref={mainRef}>
      {elVideo}
    </div>
  );

  const elFooter = (
    <div {...styles.footer}>
      <div />
      <RecordButton
        bus={bus}
        stream={stream}
        size={45}
        state={record.state}
        onClick={record.onClick}
        style={{ marginBottom: 20 }}
      />
      <div />
    </div>
  );

  return (
    <DevModal bus={bus} style={css(styles.base, props.style)}>
      {elMain}
      {elFooter}
    </DevModal>
  );
};
