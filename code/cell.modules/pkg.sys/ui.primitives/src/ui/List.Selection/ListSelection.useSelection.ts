import { useEffect, useState } from 'react';

import { t, rx } from './common';
import { ListSelectionMonitor, ListSelectionMonitorArgs } from './ListSelection.Monitor';

/**
 * Selection monitor (hook)
 */
export function useListSelection(args: ListSelectionMonitorArgs): t.ListSelectionHook {
  const { bus, instance, multi, clearOnBlur, allowEmpty, onChange } = args;
  const [current, setCurrent] = useState<t.ListSelection>({ indexes: [] });

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const monitor = ListSelectionMonitor({
      bus,
      instance,
      multi,
      clearOnBlur,
      allowEmpty,
      onChange,
    });
    monitor.changed$.subscribe((e) => setCurrent(e));
    return () => monitor.dispose();
  }, [bus, instance, multi, clearOnBlur, allowEmpty, onChange]);

  /**
   * API
   */
  return {
    bus: rx.bus.instance(bus),
    instance,
    current,
  };
}
