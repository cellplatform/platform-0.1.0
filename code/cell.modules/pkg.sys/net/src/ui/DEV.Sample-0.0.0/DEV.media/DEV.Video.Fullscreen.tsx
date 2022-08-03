import React from 'react';
import { RecordButton, useRecordController } from 'sys.ui.video/lib/ui/RecordButton';

import {
  COLORS,
  css,
  CssValue,
  t,
  useResizeObserver,
  VideoStream,
  isLocalhost,
} from '../DEV.common';
import { DevModal } from '../DEV.layouts';

export type DevVideoFullscreenProps = {
  children?: React.ReactNode;
  bus: t.EventBus<any>;
  stream?: MediaStream;
  isSelf?: boolean;
  isRecordable?: boolean;
  style?: CssValue;
};

export const DevVideoFullscreen: React.FC<DevVideoFullscreenProps> = (props) => {
  const { stream, isSelf, isRecordable = false } = props;
  const bus = props.bus as t.EventBus<t.DevEvent>;

  const resize = useResizeObserver();
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
      isMuted={isLocalhost || isSelf ? true : false}
      borderRadius={0}
    />
  );

  const elMain = (
    <div ref={resize.ref} {...styles.main}>
      {elVideo}
    </div>
  );

  const elFooter = (
    <div {...styles.footer}>
      <div />
      {isRecordable && (
        <RecordButton
          bus={bus}
          stream={stream}
          size={45}
          state={record.state}
          onClick={record.onClick}
          style={{ marginBottom: 20 }}
        />
      )}
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
