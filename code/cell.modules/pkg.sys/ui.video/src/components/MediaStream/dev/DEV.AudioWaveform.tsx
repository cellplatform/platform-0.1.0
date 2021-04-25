import React, { useEffect, useState } from 'react';

import { AudioWaveform } from '../../AudioWaveform';
import { MediaStreamEvents } from '../MediaStream.Events';
import { CssValue, t } from './common';

export type DevAudioWaveformProps = {
  streamRef?: string; // Stream ID reference.
  bus: t.EventBus<any>;
  width?: number;
  height?: number;
  style?: CssValue;
};

export const DevAudioWaveform: React.FC<DevAudioWaveformProps> = (props) => {
  const { width = 300, height = 30 } = props;

  const ref = props.streamRef;
  const bus = props.bus.type<t.MediaEvent>();
  const [stream, setStream] = useState<MediaStream | undefined>();

  /**
   * Get hold of the Media Stream.
   */
  useEffect(() => {
    const events = MediaStreamEvents(bus);

    if (ref) {
      events.started(ref).$.subscribe((e) => setStream(e.stream));
      if (!stream) {
        const wait = events.status(ref).get();
        wait.then((res) => {
          if (res.stream) setStream(res.stream.media);
        });
      }
    }

    return () => events.dispose();
  }, [bus, ref]); // eslint-disable-line

  return <AudioWaveform width={width} height={height} stream={stream} />;
};
