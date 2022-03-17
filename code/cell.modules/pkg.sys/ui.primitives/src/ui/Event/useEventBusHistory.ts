import { useEffect, useState } from 'react';
import { animationFrameScheduler, Subject } from 'rxjs';
import { observeOn, takeUntil, filter } from 'rxjs/operators';

import { t, slug, time } from '../../common';

/**
 * Captures a running history of events within a stateful array.
 */
export const useEventBusHistory: t.EventBusHistoryHook = (bus, options = {}) => {
  const { reset$ } = options;
  const [events, setEvents] = useState<t.EventHistoryItem[]>([]);

  useEffect(() => {
    const history = EventBusHistoryMonitor(bus, options);
    history.changed$.subscribe(() => setEvents(() => history.events));
    return () => history.dispose();
  }, [bus, reset$]); // eslint-disable-line

  return {
    events,
    get total() {
      return events.length;
    },
  };
};

/**
 * Monitor
 */
export function EventBusHistoryMonitor(
  bus?: t.EventBus<any>,
  options: t.EventBusHistoryOptions = {},
) {
  const dispose$ = new Subject<void>();
  const dispose = () => dispose$.next();

  const events: t.EventHistoryItem[] = []; // NB: Event array is appended (not immutable) for performance reasons.

  const changed$ = new Subject<t.EventHistoryItem[]>();
  const changed = () => changed$.next(events);

  const reset = () => {
    events.length = 0;
    changed();
  };

  if (bus) {
    const $ = bus.$.pipe(
      takeUntil(dispose$),
      filter((e) => (options.filter ? options.filter(e) : true)),
      observeOn(animationFrameScheduler),
    );

    $.subscribe((event) => {
      const count = events.length + 1;
      const timestamp = time.now.timestamp;
      events.push({ id: slug(), event, count, timestamp });
      options.onChange?.({ total: count, events });
      changed();
    });

    options.reset$?.pipe(takeUntil(dispose$)).subscribe(() => reset());
  }

  return {
    dispose,
    dispose$,
    changed$: changed$.pipe(takeUntil(dispose$)),
    events,
    get total() {
      return events.length;
    },
  };
}
