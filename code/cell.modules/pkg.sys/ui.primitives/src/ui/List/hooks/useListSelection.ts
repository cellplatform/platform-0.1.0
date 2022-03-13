import { useEffect, useState } from 'react';

import { t, Keyboard, rx } from '../common';
import { ListSelectionMonitor, ListSelectionMonitorArgs } from '../ListSelectionMonitor';

/**
 * Selection monitor (hook)
 */
export function useListSelection(args: ListSelectionMonitorArgs) {
  const { bus, instance } = args;
  const [selection, setSelection] = useState<t.ListSelection>({ indexes: [] });

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const monitor = ListSelectionMonitor({ bus, instance });
    monitor.changed$.subscribe((e) => setSelection(e));
    return () => monitor.dispose();
  }, [bus, instance]);

  /**
   * API
   */
  return {
    bus: rx.bus.instance(bus),
    instance,
    selection,
  };
}
