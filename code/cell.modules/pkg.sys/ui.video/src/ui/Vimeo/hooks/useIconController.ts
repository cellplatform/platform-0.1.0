import { Observable, Subject, BehaviorSubject, firstValueFrom, timeout, of } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
  tap,
  catchError,
} from 'rxjs/operators';
import { useEffect, useState } from 'react';

import { types, t, rx } from '../common';
import { VimeoEvents } from '../VimeoEvents';

/**
 * Monitors a Videmo player providing icon values to display based on various strategies..
 */
export function useIconController(args: {
  bus: t.EventBus<any>;
  id: types.VimeoInstance;
  isEnabled?: boolean;
}) {
  const { id, isEnabled = true } = args;
  const [icon, setIcon] = useState<types.VimeoIconFlag | undefined>();

  /**
   * Lifecycle
   */
  useEffect(() => {
    const bus = rx.busAsType<t.VimeoEvent>(args.bus);
    const events = VimeoEvents({ id, bus, isEnabled });
    const status$ = events.status.$.pipe();
    const start$ = status$.pipe(filter((e) => e.action === 'start'));
    const loaded$ = status$.pipe(filter((e) => e.action === 'start'));

    let currentVideo: types.VimeoId;
    const buffered: types.VimeoId[] = [];
    const isBuffered = () => buffered.includes(currentVideo);

    loaded$.subscribe((e) => (currentVideo = e.video));
    (async () => {
      const status = (await events.status.get()).status;
      if (status) currentVideo = status.video;
    })();

    /**
     * Show spinner when buffering new video.
     */
    events.play.req$.pipe(filter((e) => !isBuffered())).subscribe(async (e) => {
      setIcon('spinner');
      start$.pipe(take(1)).subscribe(() => {
        setIcon(undefined);
        buffered.push(currentVideo);
      });
    });

    return () => events.dispose();
  }, [args.bus, id, isEnabled]);

  // Finish up.
  return {
    isEnabled,
    current: icon,
  };
}
