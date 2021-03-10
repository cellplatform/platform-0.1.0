import VimeoPlayer from '@vimeo/player';
import { useEffect, useRef } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { R, rx, t } from '../../common';
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
  const lastKind = useRef<K>();
  const { id, player, video, autoPlay } = args;

  useEffect(() => {
    const dispose$ = new Subject<void>();

    if (args.bus && id && player) {
      const bus = (args.bus || rx.bus()).type<types.VimeoEvent>();
      const $ = bus.event$.pipe(
        takeUntil(dispose$),
        filter((e) => e.payload.id === id),
      );

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
        setCurrentTime(player, e.seconds, autoPlay);
      });

      rx.payload<types.VimeoPlayEvent>($, 'Vimeo/play').subscribe((e) => player.play());
      rx.payload<types.VimeoPauseEvent>($, 'Vimeo/pause').subscribe((e) => player.pause());

      if (autoPlay) player.play();
    }

    return () => {
      dispose$.next();
    };
  }, [args.bus, id, player]); // eslint-disable-line
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
