import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, t } from './common';
import { useAudioAnalyser } from './DEV.waveform.useAudioAnalyser';
import { useDrawWaveform } from './DEV.waveform.useDrawWaveform';
import { MediaStreamEvents } from '../MediaStream.Events';

export type WaveformProps = {
  stream?: string; // Stream ID reference.
  bus: t.EventBus<any>;
  width?: number;
  height?: number;
  style?: CssValue;
};

/**
 *  Samples:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
 *    https://www.twilio.com/blog/audio-visualisation-web-audio-api--react
 *
 */
export const Waveform: React.FC<WaveformProps> = (props) => {
  const { width = 300, height = 30 } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ref = props.stream;
  const bus = props.bus.type<t.MediaEvent>();
  const [stream, setStream] = useState<MediaStream | undefined>();

  const { audioData } = useAudioAnalyser({ stream });
  useDrawWaveform({ canvasRef, audioData });

  /**
   * Get hold of the Stream.
   */
  useEffect(() => {
    const events = MediaStreamEvents({ bus });

    if (ref) {
      events.started(ref).$.subscribe((e) => setStream(e.stream));
      if (!stream) {
        const wait = events.status(ref).get();
        wait.then((e) => {
          if (e.stream) setStream(e.stream.media);
        });
      }
    }

    return () => events.dispose();
  }, [bus, ref]); // eslint-disable-line

  const styles = {
    base: css({ width, height }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
