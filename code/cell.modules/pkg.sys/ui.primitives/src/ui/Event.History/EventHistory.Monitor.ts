import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { rx, slug, t, time } from '../../common';

/**
 * Monitor
 */
export function EventHistoryMonitor(bus?: t.EventBus<any>, options: t.EventHistoryOptions = {}) {
  const events: t.EventHistoryItem[] = []; // NB: Event array is appended (not immutable) for performance reasons.

  const dispose$ = new Subject<void>();
  const dispose = () => {
    dispose$.next();
    dispose$.complete();
  };

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
    );

    $.subscribe((event) => {
      const count = events.length + 1;
      const timestamp = time.now.timestamp;
      const id = `event.${slug()}`;
      events.push({ id, event, count, timestamp });
      options.onChange?.(events);
      changed();
    });

    options.reset$?.pipe(takeUntil(dispose$)).subscribe(() => reset());
  }

  return {
    dispose,
    dispose$,
    bus: bus ? rx.bus.instance(bus) : '',
    changed$: changed$.pipe(takeUntil(dispose$)),
    events,
    get total() {
      return events.length;
    },
  };
}
