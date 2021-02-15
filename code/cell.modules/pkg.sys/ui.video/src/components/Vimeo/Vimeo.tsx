import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, defaultValue } from '../../common';

import Player from '@vimeo/player';

export type VimeoProps = {
  video: number;
  controls?: boolean;
  width?: number;
  height?: number;
  style?: CssValue;
};

/**
 * Wrapper for the Vimeo player API.
 * https://github.com/vimeo/player.js
 */
export const Vimeo: React.FC<VimeoProps> = (props) => {
  const { video, width, height } = props;
  const controls = defaultValue(props.controls, true);
  const divRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player>();

  useEffect(() => {
    const div = divRef.current as HTMLDivElement;

    const player = new Player(div, {
      id: video,
      controls,
      transparent: true,
    });

    playerRef.current = player;

    player.on('timeupdate', (data: { duration: number; percent: number; seconds: number }) => {
      console.log('data', data);
    });

    return () => {
      player?.destroy();
    };
  }, [video, controls]);

  const styles = {
    base: css({
      position: 'relative',
    }),
  };

  return <div ref={divRef} {...css(styles.base, props.style)}></div>;
};
