import React, { useEffect, useState } from 'react';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { slug, t } from '../../common';
import { EventLogItem, EventBusHistoryHook } from './types';

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

    if (reset$) {
      reset$.pipe(takeUntil(dispose$)).subscribe(() => reset());
    }

    bus.event$.pipe(takeUntil(dispose$)).subscribe((event) => {
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
