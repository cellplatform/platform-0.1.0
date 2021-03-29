import React, { useEffect } from 'react';

/**
 * Renders an oscilloscope waveform visualization to a <canvas>.
 *
 * Sample:
 *    https://www.twilio.com/blog/audio-visualisation-web-audio-api--react
 *
 */
export function useDrawWaveform(args: {
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  audioData?: Uint8Array;
}) {
  useEffect(() => {
    const { audioData } = args;
    const canvas = args.canvasRef?.current;
    if (canvas && audioData) draw({ canvas, audioData });
  });
}

/**
 * [Helpers]
 */
const draw = (args: { canvas: HTMLCanvasElement; audioData: Uint8Array }) => {
  const { canvas, audioData } = args;

  const { width, height } = canvas;
  const ctx = canvas.getContext('2d');
  const sliceWidth = (width * 1.0) / audioData.length;
  let x = 0;

  if (ctx) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    audioData.forEach((item) => {
      const y = (item / 255.0) * height;
      ctx.lineTo(x, y);
      x += sliceWidth;
    });

    ctx.lineTo(x, height / 2);
    ctx.stroke();
  }
};
