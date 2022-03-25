import { useEffect, useState } from 'react';

import { t, rx } from '../../common';
import { EventHistoryMonitor } from './EventHistory.Monitor';

/**
 * Captures a running history of events within a stateful array.
 */
export const useEventHistory: t.UseEventHistory = (bus, options = {}) => {
  const { reset$ } = options;
  const [events, setEvents] = useState<t.EventHistoryItem[]>([]);

  useEffect(() => {
    const monitor = EventHistoryMonitor(bus, options);
    monitor.changed$.subscribe(() => setEvents(monitor.events));
    return () => monitor.dispose();
  }, [bus, reset$]); // eslint-disable-line

  return {
    bus: bus ? rx.bus.instance(bus) : '',
    events,
    get total() {
      return events.length;
    },
  };
};
