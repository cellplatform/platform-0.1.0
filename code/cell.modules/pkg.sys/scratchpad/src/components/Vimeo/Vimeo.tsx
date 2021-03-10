import VimeoPlayer from '@vimeo/player';
import React, { useEffect, useRef } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { css, CssValue, cuid, defaultValue, R, rx, t } from '../../common';
import * as types from './types';

export type VimeoProps = {
  bus?: t.EventBus<any>;
  id?: string;
  video: number;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  width?: number;
  height?: number;
  style?: CssValue;
};

type D = { duration: number; percent: number; seconds: number };
type K = types.VimeoStatus['kind'];

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
    const dispose$ = new Subject<void>();
    const id = props.id || cuid();
    const div = divRef.current as HTMLDivElement;

    const bus = (props.bus || rx.bus()).type<types.VimeoEvent>();
    const $ = bus.event$.pipe(
      takeUntil(dispose$),
      filter((e) => e.payload.id === id),
    );

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

    const fireStatus = (kind: K, data: D) => {
      bus.fire({
        type: 'Vimeo/status',
        payload: { id, video, kind, ...data },
      });
    };

    player.on('timeupdate', (data: D) => {
      const kind: K = lastKind.current === 'playing' ? 'playing' : 'start';
      lastKind.current = 'playing';
      fireStatus(kind, data);
    });
    player.on('pause', (data: D) => fireStatus('pause', data));
    player.on('ended', (data: D) => fireStatus('end', data));

    rx.payload<types.VimeoSeekEvent>($, 'Vimeo/seek').subscribe((e) => {
      currentTime(player, e.seconds, props.autoPlay);
    });

    rx.payload<types.VimeoPlayEvent>($, 'Vimeo/play').subscribe((e) => player.play());
    rx.payload<types.VimeoPauseEvent>($, 'Vimeo/pause').subscribe((e) => player.pause());

    if (props.autoPlay) player.play();

    return () => {
      player?.destroy();
      dispose$.next();
    };
  }, [controls, width, height, props.autoPlay]); // eslint-disable-line

  useEffect(() => {
    loadVideo(playerRef.current as VimeoPlayer, video);
  }, [video]);

  useEffect(() => {
    const player = playerRef.current as VimeoPlayer;
    player.setLoop(props.loop || false);
  }, [props.loop]);

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
