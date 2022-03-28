import { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';

import { rx, t } from '../../common';
import { EventHistoryMonitor } from './EventHistory.Monitor';

/**
 * Captures a running history of events within a stateful array.
 */
export const useEventHistory: t.UseEventHistory = (bus, options = {}) => {
  const [events, setEvents] = useState<t.EventHistoryItem[]>([]);
  const resetRef$ = useRef(new Subject<void>());

  useEffect(() => {
    const reset$ = resetRef$.current;
    const monitor = EventHistoryMonitor(bus, { ...options, reset$ });

    monitor.changed$.subscribe(() => setEvents(monitor.events));
    options.reset$?.subscribe(() => {
      reset$.next();
      setEvents([]);
    });

    return () => monitor.dispose();
  }, [bus, options.reset$]); // eslint-disable-line

  /**
   * API
   */
  return {
    bus: bus ? rx.bus.instance(bus) : '',
    events,
    get total() {
      return events.length;
    },
    reset() {
      resetRef$.current.next();
    },
  };
};
