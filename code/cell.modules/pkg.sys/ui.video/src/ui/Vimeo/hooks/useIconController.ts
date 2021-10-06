import { useEffect, useState } from 'react';
import { distinctUntilChanged, filter, take } from 'rxjs/operators';

import { rx, t } from '../common';
import { VimeoEvents } from '../VimeoEvents';

/**
 * Monitors a Videmo player providing icon values to display based on various strategies..
 */
export const useIconController: t.UseVimeoIconController = (args: {
  bus: t.EventBus<any>;
  id: t.VimeoInstance;
  showPlayPause?: boolean;
  isEnabled?: boolean;
}) => {
  const { id, isEnabled = true, showPlayPause = true } = args;
  const [icon, setIcon] = useState<t.VimeoIconFlag | undefined>();

  /**
   * Lifecycle
   */
  useEffect(() => {
    const bus = rx.busAsType<t.VimeoEvent>(args.bus);
    const events = VimeoEvents({ id, bus, isEnabled });
    const status$ = events.status.$.pipe();
    const start$ = status$.pipe(filter((e) => e.action === 'start'));
    const loaded$ = status$.pipe(filter((e) => e.action === 'start'));

    let currentVideo: t.VimeoId;
    let isBuffering = false;
    const buffered: t.VimeoId[] = [];
    const isBuffered = () => buffered.includes(currentVideo);

    const getStatus = async () => (await events.status.get()).status;

    loaded$.subscribe((e) => (currentVideo = e.video));
    (async () => {
      const status = await getStatus();
      if (status) currentVideo = status.video;
    })();

    const updatePlayVisibility = async () => {
      if (!showPlayPause) return;
      if (!isEnabled) {
        setIcon(undefined);
        return;
      }

      const status = await getStatus();
      const isPlaying = status?.playing ?? false;

      if (!isBuffering) {
        if (!isPlaying) setIcon('play');
        if (isPlaying) setIcon(undefined);
      }
    };

    /**
     * Video <ID> changed ("load").
     */
    events.load.res$.subscribe(async (e) => {
      const video = e.status?.video;
      if (video) currentVideo = video;
    });

    /**
     * Play/Pause state changed.
     */
    status$
      .pipe(distinctUntilChanged((prev, next) => prev.playing === next.playing))
      .subscribe(async (e) => {
        await updatePlayVisibility();
      });

    /**
     * Show spinner when buffering new video.
     */
    events.play.req$.pipe(filter((e) => !isBuffered())).subscribe(async (e) => {
      isBuffering = true;
      setIcon('spinner');
      start$.pipe(take(1)).subscribe(() => {
        setIcon(undefined);
        buffered.push(currentVideo);
        isBuffering = false;
      });
    });

    updatePlayVisibility();
    return () => events.dispose();
  }, [args.bus, id, isEnabled, showPlayPause]);

  // Finish up.
  return {
    isEnabled,
    current: icon,
  };
};
