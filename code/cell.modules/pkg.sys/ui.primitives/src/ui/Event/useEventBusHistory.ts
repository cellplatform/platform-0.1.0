import { useEffect, useState } from 'react';
import { animationFrameScheduler, Subject } from 'rxjs';
import { observeOn, takeUntil, filter } from 'rxjs/operators';

import { slug, time } from '../../common';
import { EventBusHistoryHook, EventHistoryItem } from './types';

/**
 * Captures a running history of events within a state array.
 */
export const useEventBusHistory: EventBusHistoryHook = (bus, options = {}) => {
  const { max, reset$, insertAt = 'End' } = options;
  const [events, setEvents] = useState<EventHistoryItem[]>([]);
  const [total, setTotal] = useState<number>(0);

  const reset = () => {
    setEvents([]);
    setTotal(0);
  };

  useEffect(() => {
    const dispose$ = new Subject<void>();
    if (!bus) return;

    const $ = bus.$.pipe(
      takeUntil(dispose$),
      filter((e) => (options.filter ? options.filter(e) : true)),
      observeOn(animationFrameScheduler),
    );

    if (reset$) {
      reset$.pipe(takeUntil(dispose$)).subscribe(() => {
        console.log('reset');
        reset();
      });
    }

    $.subscribe((event) => {
      let count = 0;

      setTotal((prev) => {
        count = prev + 1;
        return count;
      });

      setEvents((prev) => {
        const timestamp = time.now.timestamp;
        const item: EventHistoryItem = { id: slug(), event, count, timestamp };

        let events = insertAt === 'Start' ? [item, ...prev] : [...prev, item];

        if (max !== undefined) events = events.slice(events.length - max);
        if (options.onChange) options.onChange({ total: count, events });
        return events;
      });
    });

    return () => dispose$.next();
  }, [bus, reset$, insertAt]); // eslint-disable-line

  return { total, events, reset };
};
