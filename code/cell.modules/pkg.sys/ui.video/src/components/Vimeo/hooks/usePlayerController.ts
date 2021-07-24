import VimeoPlayer from '@vimeo/player';
import { useEffect, useRef, useState } from 'react';

import { deleteUndefined, R, rx, slug, t, time } from '../common';
import { VimeoEvents } from '../Events';

type D = { duration: number; percent: number; seconds: number };
type K = t.VimeoStatus['kind'];

/**
 * Event-bus controller for a Vimeo player.
 */
export function usePlayerController(args: {
  bus: t.EventBus<any>;
  id: string;
  video: number;
  player?: VimeoPlayer;
}) {
  const seekRef = useRef<number | undefined>();
  const playing = useRef<boolean>(false);
  const loading = useRef<number | undefined>(); // Video-ID.

  const { id, player, video } = args;

  useEffect(() => {
    const bus = rx.busAsType<t.VimeoEvent>(args.bus);
    const events = VimeoEvents({ id, bus });

    const getCurrent = async (): Promise<D> => {
      if (!player) return { duration: -1, percent: -1, seconds: -1 };
      const duration = await player.getDuration();
      const seconds = await player.getCurrentTime();
      const percent = duration === 0 ? 0 : seconds / duration;
      return { duration, seconds, percent };
    };

    const toStatus = (kind: K, data: D): t.VimeoStatus => {
      return deleteUndefined({
        id,
        video,
        kind,
        ...data,
        percent: Math.min(data.percent, 1),
        playing: playing.current,
        ended: data.seconds >= data.duration,
      });
    };

    const fireStatus = (kind: K, data: D) => {
      if (loading.current && kind !== 'loaded') return;
      bus.fire({
        type: 'Vimeo/status',
        payload: toStatus(kind, data),
      });
    };

    const onLoaded = async () => {
      loading.current = video;

      // HACK: Force load the video's first frame by playing then immediately stopping.
      //       This allows seeking behavior to work correctly, whereby changes to
      //       the "seek" position nothing until the video has started playing.
      await events.play.fire();
      await events.pause.fire();

      // Alert listeners.
      fireStatus('loaded', await getCurrent());

      // Finish up.
      loading.current = undefined;
    };

    const onUpdate = (data: D) => {
      const status: K = seekRef.current !== undefined ? 'seek' : 'update';

      fireStatus(status, data);
      seekRef.current = undefined;
    };
    const onPlay = (data: D) => {
      const wasPlaying = playing.current;
      playing.current = true;
      if (!wasPlaying) fireStatus('start', data);
    };
    const onPause = (data: D) => {
      const wasPlaying = playing.current;
      playing.current = false;
      if (wasPlaying) fireStatus('stop', data);
    };
    const onEnd = (data: D) => {
      playing.current = false;
      fireStatus('end', data);
    };

    if (player) {
      player.on('loaded', onLoaded);
      player.on('play', onPlay);
      player.on('timeupdate', onUpdate);
      player.on('pause', onPause);
      player.on('ended', onEnd);

      /**
       * Contoller: Status.
       */
      events.status.req$.subscribe(async (e) => {
        const { tx = slug() } = e;
        const data = await getCurrent();
        const status = toStatus('update', data);
        fireStatus('update', data);
        bus.fire({
          type: 'Vimeo/status:res',
          payload: { tx, id, status },
        });
      });

      /**
       * Controller: Play.
       */
      events.play.req$.subscribe(async (e) => {
        const { tx = slug() } = e;
        await player.play();
        bus.fire({ type: 'Vimeo/play:res', payload: { tx, id } });
      });

      /**
       * Controller: Pause.
       */
      events.pause.req$.subscribe(async (e) => {
        const { tx = slug() } = e;
        await player.pause();
        bus.fire({ type: 'Vimeo/pause:res', payload: { tx, id } });
      });

      /**
       * Contoller: Seek.
       */
      events.seek.req$.subscribe(async (e) => {
        const { tx = slug() } = e;
        const secs = R.clamp(0, await player.getDuration(), e.seconds);
        seekRef.current = secs;
        await player.setCurrentTime(secs);
        bus.fire({ type: 'Vimeo/seek:res', payload: { tx, id } });
      });
    }

    return () => {
      /**
       * Dispose.
       */
      if (player) {
        player.off('loaded', onLoaded);
        player.off('play', onPlay);
        player.off('timeupdate', onUpdate);
        player.off('pause', onPause);
        player.off('ended', onEnd);
      }
      events.dispose();
    };
  }, [args.bus, id, player]); // eslint-disable-line

  // Finish up.
  return { id };
}
