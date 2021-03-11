import VimeoPlayer from '@vimeo/player';
import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, cuid, t } from '../../common';
import { usePlayerController } from './usePlayerController';

export type VimeoProps = {
  bus?: t.EventBus<any>;
  id?: string;
  video: number;
  autoPlay?: boolean;
  loop?: boolean;
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: CssValue;
};

/**
 * Wrapper for the Vimeo player API.
 * https://github.com/vimeo/player.js
 */
export const Vimeo: React.FC<VimeoProps> = (props) => {
  const { video, width, height, bus, autoPlay, borderRadius } = props;
  const divRef = useRef<HTMLDivElement>(null);

  console.log('borderRadius', borderRadius);

  const idRef = useRef<string>(props.id || cuid());
  const [player, setPlayer] = useState<VimeoPlayer>();

  useEffect(() => {
    const div = divRef.current as HTMLDivElement;

    const player = new VimeoPlayer(div, {
      id: video,
      width,
      height,
      controls: false,
      transparent: true,
      title: false,
      byline: false,
      portrait: false,
      dnt: true, // Do Not Track (no cookies or other tracking attempts)
    });

    setPlayer(player);

    player.on('loaded', () => {
      if (autoPlay) player.play();
    });

    return () => {
      player?.destroy();
    };
  }, [width, height]); // eslint-disable-line

  usePlayerController({ id: idRef.current, video, player, bus });

  useEffect(() => {
    if (player) loadVideo(player, video, autoPlay);
  }, [video, player]); // eslint-disable-line

  useEffect(() => {
    player?.setLoop(props.loop || false);
  }, [player, props.loop]);

  const styles = {
    base: css({
      lineHeight: 0, // NB: Prevents space below IFrame.
      position: 'relative',
      overflow: 'hidden',
      borderRadius,
      width,
      height,
    }),
  };

  return <div ref={divRef} {...css(styles.base, props.style)}></div>;
};

/**
 * Helpers
 */
async function loadVideo(player: VimeoPlayer, video: number, autoPlay?: boolean) {
  if (video !== (await player.getVideoId())) {
    await player.loadVideo(video);
    if (autoPlay) await player.play();
  }
}
