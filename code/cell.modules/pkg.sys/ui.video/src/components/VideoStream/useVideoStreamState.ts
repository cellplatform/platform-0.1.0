import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, t } from '../../common';

/**
 * Manages state from an event-but for the <VideoStream>.
 */
export function useVideoStreamState(args: { id: string; bus: t.EventBus<any> }) {
  const { id } = args;
  const bus = args.bus.type<t.VideoEvent>();
  const [stream, setStream] = useState<MediaStream | undefined>();

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.event$.pipe(takeUntil(dispose$));

    rx.payload<t.VideoStreamStartedEvent>($, 'VideoStream/started')
      .pipe(filter((e) => e.ref === id))
      .subscribe((e) => setStream(e.stream));

    return () => dispose$.next();
  }, [bus, id]);

  return { stream };
}
