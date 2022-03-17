import { useEffect, useState } from 'react';

import { t, rx, DEFAULTS } from './common';
import { ListSelectionMonitor, ListSelectionMonitorArgs } from './ListSelection.Monitor';

type Args = ListSelectionMonitorArgs & { onChange?: (e: t.ListSeletionState) => void };

/**
 * Selection monitor (hook)
 */
export function useListSelection(args: Args): t.ListSelectionHook {
  const { bus, instance, multi, clearOnBlur, allowEmpty, onChange, reset$, ctx } = args;
  const [current, setCurrent] = useState<t.ListSeletionState>(DEFAULTS.state);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const selection = ListSelectionMonitor({
      bus,
      instance,
      reset$,
      ctx,
      multi,
      clearOnBlur,
      allowEmpty,
    });

    selection.changed$.subscribe((e) => {
      setCurrent(e);
      onChange?.(e);
    });

    return () => selection.dispose();
  }, [bus, instance, multi, clearOnBlur, allowEmpty, reset$, ctx, onChange]);

  /**
   * API
   */
  return {
    bus: rx.bus.instance(bus),
    instance,
    current,
  };
}
