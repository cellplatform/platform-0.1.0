import VimeoPlayer from '@vimeo/player';
import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue, cuid, defaultValue, t } from '../../common';
import { usePlayerController } from './usePlayerController';

export type VimeoProps = {
  bus?: t.EventBus<any>;
  id?: string;
  video: number;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  width?: number;
  height?: number;
  style?: CssValue;
};

/**
 * Wrapper for the Vimeo player API.
 * https://github.com/vimeo/player.js
 */
export const Vimeo: React.FC<VimeoProps> = (props) => {
  const { video, width, height, bus, autoPlay } = props;
  const controls = defaultValue(props.controls, true);
  const divRef = useRef<HTMLDivElement>(null);

  const idRef = useRef<string>(props.id || cuid());
  const [player, setPlayer] = useState<VimeoPlayer>();

  useEffect(() => {
    const div = divRef.current as HTMLDivElement;

    setPlayer(
      new VimeoPlayer(div, {
        id: video,
        controls,
        width,
        height,
        transparent: true,
        title: false,
        byline: false,
        portrait: false,
        dnt: true, // Do Not Track (no cookies or other tracking attempts)
      }),
    );

    return () => {
      player?.destroy();
    };
  }, [controls, width, height]); // eslint-disable-line

  usePlayerController({ id: idRef.current, video, player, bus, autoPlay });

  useEffect(() => {
    if (player) loadVideo(player, video);
  }, [video, player]);

  useEffect(() => {
    player?.setLoop(props.loop || false);
  }, [player, props.loop]);

  const styles = {
    base: css({
      position: 'relative',
      lineHeight: 0,
    }),
  };

  return <div ref={divRef} {...css(styles.base, props.style)}></div>;
};

/**
 * Helpers
 */
async function loadVideo(player: VimeoPlayer, video: number) {
  if (video !== (await player.getVideoId())) {
    await player.loadVideo(video);
  }
}
