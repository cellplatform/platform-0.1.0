import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, defaultValue, R } from '../../common';

import VimeoPlayer from '@vimeo/player';

export type VimeoTimeUpdateEvent = {
  kind: 'start' | 'playing' | 'pause' | 'end';
  video: number;
  seconds: number;
  percent: number;
  duration: number;
};
export type VimeoTimeUpdateEventHandler = (e: VimeoTimeUpdateEvent) => void;

export type VimeoProps = {
  video: number;
  controls?: boolean;
  isPlaying?: boolean;
  isLooping?: boolean;
  skipTo?: number; // seconds
  width?: number;
  height?: number;
  style?: CssValue;
  onUpdate?: VimeoTimeUpdateEventHandler;
};

type D = { duration: number; percent: number; seconds: number };
type K = VimeoTimeUpdateEvent['kind'];

/**
 * Wrapper for the Vimeo player API.
 * https://github.com/vimeo/player.js
 */
export const Vimeo: React.FC<VimeoProps> = (props) => {
  const { video, width, height } = props;
  const controls = defaultValue(props.controls, true);
  const divRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VimeoPlayer>();
  const lastKind = useRef<K>();

  useEffect(() => {
    const div = divRef.current as HTMLDivElement;

    const player = new VimeoPlayer(div, {
      id: video,
      controls,
      width,
      height,
      transparent: true,
      title: false,
      byline: false,
      portrait: false,
      dnt: true, // Do Not Track (no cookies or other tracking attempts)
    });
    playerRef.current = player;

    const fire = (kind: K, data: D) => {
      if (props.onUpdate) props.onUpdate({ video, kind, ...data });
    };

    player.on('timeupdate', (data: D) => {
      const kind: K = lastKind.current === 'playing' ? 'playing' : 'start';
      lastKind.current = 'playing';
      fire(kind, data);
    });
    player.on('pause', (data: D) => fire('pause', data));
    player.on('ended', (data: D) => fire('end', data));

    return () => {
      player?.destroy();
    };
  }, [controls, width, height]); // eslint-disable-line

  useEffect(() => {
    loadVideo(playerRef.current as VimeoPlayer, video);
  }, [video]);

  useEffect(() => {
    if (typeof props.skipTo === 'number') {
      const player = playerRef.current as VimeoPlayer;
      currentTime(player, props.skipTo, props.isPlaying);
    }
  }, [props.skipTo]); // eslint-disable-line

  useEffect(() => {
    const player = playerRef.current as VimeoPlayer;
    if (props.isPlaying) player.play();
    if (!props.isPlaying) player.pause();
    player.setLoop(props.isLooping || false);
  }, [props.isPlaying, props.isLooping]);

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

async function currentTime(player: VimeoPlayer, seconds: number, isPlaying?: boolean) {
  const max = await player.getDuration();
  const secs = R.clamp(0, max, seconds);
  await player.setCurrentTime(secs);
  if (isPlaying && secs < max) player.play();
}
