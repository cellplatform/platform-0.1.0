import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t } from './common';
import { RecordButton, RecordButtonState, useRecordController } from '../../RecordButton';
import { useStreamState } from '..';

export type DevRecordButtonProps = {
  streamRef?: string; // MediaStream ID.
  downloadFilename?: string;
  bus: t.EventBus<any>;
  style?: CssValue;
  onFileReady?: (e: { mimetype: string; data: Uint8Array; bytes: number }) => void;
};

export const DevRecordButton: React.FC<DevRecordButtonProps> = (props) => {
  const bus = props.bus as t.EventBus<t.MediaEvent>;

  const ref = props.streamRef;
  const stream = useStreamState({ bus, ref });
  const recorder = useRecordController({
    bus,
    stream,
    filename: props.downloadFilename,
    async onData(e) {
      if (props.onFileReady) {
        const { mimetype, bytes } = e;
        const data = await e.toUint8Array(e.blob);
        props.onFileReady({ mimetype, bytes, data });
      }
    },
  });

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
