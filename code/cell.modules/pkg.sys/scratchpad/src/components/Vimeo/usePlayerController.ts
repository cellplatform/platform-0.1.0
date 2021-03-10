import VimeoPlayer from '@vimeo/player';
import { useEffect, useRef } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { R, rx, t, deleteUndefined } from '../../common';
import * as types from './types';

type D = { duration: number; percent: number; seconds: number };
type K = types.VimeoStatus['kind'];

/**
 * Event-bus controller for a Vimeo player.
 */
export function usePlayerController(args: {
  id: string;
  video: number;
  player?: VimeoPlayer;
  bus?: t.EventBus<any>;
  autoPlay?: boolean;
}) {
  const seekRef = useRef<number | undefined>();
  const { id, player, video, autoPlay } = args;

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const bus = (args.bus || rx.bus()).type<types.VimeoEvent>();

    const fireStatus = (kind: K, data: D) => {
      bus?.fire({
        type: 'Vimeo/status',
        payload: deleteUndefined({ id, video, kind, ...data, seek: seekRef.current }),
      });
    };

    const onPlay = (data: D) => {
      fireStatus('start', data);
    };
    const onUpdate = (data: D) => {
      fireStatus('playing', data);
      seekRef.current = undefined;
    };
    const onPause = (data: D) => {
      fireStatus('pause', data);
    };
    const onEnd = (data: D) => {
      fireStatus('end', data);
    };

    if (args.bus && id && player) {
      const $ = bus.event$.pipe(
        takeUntil(dispose$),
        filter((e) => e.payload.id === id),
      );

      player.on('play', onPlay);
      player.on('timeupdate', onUpdate);
      player.on('pause', onPause);
      player.on('ended', onEnd);

      rx.payload<types.VimeoSeekEvent>($, 'Vimeo/seek').subscribe((e) => {
        seekRef.current = e.seconds;
        setCurrentTime(player, e.seconds, autoPlay);
      });

      rx.payload<types.VimeoPlayEvent>($, 'Vimeo/play').subscribe((e) => player.play());
      rx.payload<types.VimeoPauseEvent>($, 'Vimeo/pause').subscribe((e) => player.pause());

      if (autoPlay) player.play();
    }

    return () => {
      player?.off('play', onPlay);
      player?.off('timeupdate', onUpdate);
      player?.off('pause', onPause);
      player?.off('ended', onEnd);
      dispose$.next();
    };
  }, [args.bus, id, player, autoPlay]); // eslint-disable-line
}

/**
 * Helpers
 */

async function setCurrentTime(player: VimeoPlayer, seconds: number, isPlaying?: boolean) {
  const max = await player.getDuration();
  const secs = R.clamp(0, max, seconds);
  await player.setCurrentTime(secs);
  if (isPlaying && secs < max) player.play();
}
