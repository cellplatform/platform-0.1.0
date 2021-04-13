import { useEffect, useState } from 'react';
import { animationFrameScheduler, Subject } from 'rxjs';
import { observeOn, takeUntil } from 'rxjs/operators';

import { slug } from '../../common';
import { EventBusHistoryHook, EventLogItem } from './types';

/**
 * Captures a running history of events within a state array.
 */
export const useEventBusHistory: EventBusHistoryHook = (args) => {
  const { bus, max, reset$ } = args;
  const [events, setEvents] = useState<EventLogItem[]>([]);
  const [total, setTotal] = useState<number>(0);

  const reset = () => {
    setEvents([]);
    setTotal(0);
  };

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = bus.event$.pipe(takeUntil(dispose$), observeOn(animationFrameScheduler));

    if (reset$) {
      reset$.pipe(takeUntil(dispose$)).subscribe(reset);
    }

    $.subscribe((event) => {
      let count = 0;

      setTotal((prev) => {
        count = prev + 1;
        return count;
      });

      setEvents((prev) => {
        let events = [...prev, { id: slug(), event, count }];
        if (max !== undefined) events = events.slice(events.length - max);
        return events;
      });
    });

    return () => dispose$.next();
  }, [reset$]); // eslint-disable-line

  return { total, events, reset };
};
