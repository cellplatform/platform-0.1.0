import React, { useRef, useEffect } from 'react';
import { css, CssValue, defaultValue } from '../../common';
import Player from '@vimeo/player';

export type VimeoBackgroundProps = {
  video: string | number;
  opacity?: number;
  blur?: number;
  opacityTransition?: number; // msecs
};

export const VimeoBackground: React.FC<VimeoBackgroundProps> = (props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blur = defaultValue(props.blur, 0);
  const opacityTransition = defaultValue(props.opacityTransition, 300);

  useEffect(() => {
    // console.log('isPlaying', props.isPlaying);
    console.log('iframe.current', iframeRef.current);
    const iframe = iframeRef.current as HTMLIFrameElement;
    const player = new Player(iframe);

    return () => {
      player.destroy();
    };
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      Absolute: 0,
      overflow: 'hidden',
      opacity: props.opacity == undefined ? 1 : props.opacity,
      transition: opacityTransition ? `opacity ${opacityTransition}ms` : undefined,
      pointerEvents: 'none',
    }),
    iframe: css({
      userSelect: 'none',
      boxSizing: 'border-box',
      height: '56.25vw',
      left: '50%',
      minHeight: '100%',
      minWidth: '100%',
      transform: 'translate(-50%, -50%)',
      position: 'absolute',
      top: '50%',
      width: '177.77777778vh',
      overflow: 'hidden',
    }),
    blurMask: css({
      Absolute: 0,
      backdropFilter: `blur(${blur}px)`,
      opacity: 0.9,
      transition: opacityTransition
        ? `opacity ${opacityTransition}ms, backdrop-filter ${opacityTransition}ms`
        : undefined,
    }),
  };

  return (
    <div {...styles.base}>
      <iframe
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${props.video}?background=1`}
        frameBorder={'0'}
        allow={'autoplay'}
        allowFullScreen={false}
        {...styles.iframe}
      />
      <div {...styles.blurMask} />
    </div>
  );
};
