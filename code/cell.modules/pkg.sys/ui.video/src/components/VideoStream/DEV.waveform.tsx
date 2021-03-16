import React, { createRef, useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, time } from '../../common';
import { MediaStreamEvents } from './MediaStream.Events';

export type WaveformProps = {
  stream?: string; // Stream ID reference.
  bus: t.EventBus<any>;
  // stream?: MediaStream;
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
          if (e.stream) setStream(e.stream);
        });
      }
    }

    return () => events.dispose();
  }, [bus, ref]); // eslint-disable-line

  /**
   * Setup audio Analyzer.
   */
  useEffect(() => {
    const events = MediaStreamEvents({ bus });
    const canvas = canvasRef.current as HTMLCanvasElement;
    const canvasCtx = canvas.getContext('2d');

    if (stream) {
      console.log('stream', stream);

      /**
       *  Sample source:
       *
       *    https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
       *    https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage
       *
       */

      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();

      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      if (canvasCtx) {
        canvasCtx.clearRect(0, 0, width, height);

        const draw = () => {
          //
          // const drawVisual = requestAnimationFrame(draw);

          analyser.getByteTimeDomainData(dataArray);

          canvasCtx.fillStyle = 'rgb(0, 200, 200)';
          canvasCtx.fillRect(0, 0, width, height);

          console.log('-------------------------------------------');

          canvasCtx.lineWidth = 2;
          canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
          canvasCtx.beginPath();

          const sliceWidth = (width * 1.0) / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
          }

          requestAnimationFrame(draw);
        };

        // draw();
        requestAnimationFrame(draw);
      }

      // ctx.clearRect(0, 0, WIDTH, HEIGHT);
      // canvas;
    }

    return () => {
      events.dispose();
    };
  }, [bus, stream, ref, width, height]);

  const styles = {
    base: css({
      width,
      height,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
