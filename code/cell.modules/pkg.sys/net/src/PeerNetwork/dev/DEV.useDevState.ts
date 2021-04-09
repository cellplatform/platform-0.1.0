import { Observable, Subject, BehaviorSubject } from 'rxjs';
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
} from 'rxjs/operators';
import React, { useEffect, useState } from 'react';

import { t, rx } from './common';

export function useDevState(args: { bus: t.EventBus<any> }) {
  const bus = args.bus.type<t.DevEvent>();

  const [fullscreenMedia, setFullscreenMedia] = useState<MediaStream>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.event$.pipe(takeUntil(dispose$));

    rx.payload<t.DevMediaFullScreenEvent>($, 'DEV/media/fullscreen')
      .pipe()
      .subscribe((e) => {
        console.log('e', e);
        setFullscreenMedia(e.stream);
      });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  return {
    fullscreenMedia,
  };
}
