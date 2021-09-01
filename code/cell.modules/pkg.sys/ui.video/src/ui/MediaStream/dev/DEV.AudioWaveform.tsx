import React from 'react';

import { useStreamState } from '..';
import { AudioWaveform } from '../../AudioWaveform';
import { CssValue, t } from './common';

export type DevAudioWaveformProps = {
  streamRef?: string; // MediaStream ID.
  bus: t.EventBus<any>;
  width?: number;
  height?: number;
  style?: CssValue;
};

export const DevAudioWaveform: React.FC<DevAudioWaveformProps> = (props) => {
  const { bus, width = 300, height = 30 } = props;
  const ref = props.streamRef;

  const stream = useStreamState({ bus, ref });

  return <AudioWaveform width={width} height={height} stream={stream} />;
};
