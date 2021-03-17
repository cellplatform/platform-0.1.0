import React, { useEffect, useRef, useState } from 'react';

/**
 * Setup and maintain an AudioStream analyzer.
 * https://www.twilio.com/blog/audio-visualisation-web-audio-api--react
 */
export function useAudioAnalyser(args: { stream?: MediaStream }) {
  const [stream, setStream] = useState<MediaStream>();
  const [frame, setFrame] = useState<number>();
  const [audioData, setAudioData] = useState<Uint8Array>();

  useEffect(() => setStream(args.stream), [args.stream]);

  useEffect(() => {
    const ctx = new window.AudioContext();
    const analyser = ctx.createAnalyser();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const source = stream ? ctx.createMediaStreamSource(stream) : undefined;

    const tick = () => {
      analyser.getByteTimeDomainData(dataArray);
      setAudioData(dataArray);
      setFrame(requestAnimationFrame(tick));
    };

    if (source) {
      source.connect(analyser);
      setFrame(requestAnimationFrame(tick));
    }

    return () => {
      if (typeof frame === 'number') cancelAnimationFrame(frame);
      analyser.disconnect();
      source?.disconnect();
    };
  }, [stream]); // eslint-disable-line

  return { audioData };
}
