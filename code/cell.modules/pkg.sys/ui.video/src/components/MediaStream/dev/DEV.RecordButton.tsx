import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t } from './common';
import { RecordButton, RecordButtonState, useRecordController } from '../../RecordButton';
import { useStreamState } from '..';

export type DevRecordButtonProps = {
  streamRef?: string; // MediaStream ID.
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const DevRecordButton: React.FC<DevRecordButtonProps> = (props) => {
  const bus = props.bus.type<t.MediaEvent>();

  const ref = props.streamRef;
  const stream = useStreamState({ bus, ref });
  const recorder = useRecordController({ bus, ref });

  const styles = {
    base: css({ flex: 1, padding: 6, Flex: 'center-center' }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <RecordButton
        bus={props.bus}
        stream={stream}
        isEnabled={Boolean(stream)}
        state={recorder.state}
        onClick={recorder.onClick}
      />
    </div>
  );
};
