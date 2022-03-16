import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';

import { rx, t, UIEvent } from './common';

/**
 * Maintains state of mouse over items.
 */
export function useMouseState(args: t.ListEventArgs) {
  const { bus, instance } = args;
  const [state, setState] = useState<t.ListMouseState>({ over: -1, down: -1 });

  useEffect(() => {
    const dispose$ = new Subject<void>();

    const events = UIEvent.Events<t.CtxItem>({
      bus,
      instance,
      dispose$,
      filter: (e) => e.payload.ctx.kind === 'Item',
    });
    const handle = events.mouse.event;

    /**
     * Mouse state.
     */
    handle('onMouseEnter').subscribe((e) => {
      setState((prev) => ({ ...prev, over: e.ctx.index }));
    });

    handle('onMouseDown').subscribe((e) => {
      setState((prev) => ({ ...prev, down: e.ctx.index }));
    });

    handle('onMouseUp').subscribe((e) => {
      setState((prev) => {
        if (prev.down === e.ctx.index) prev = { ...prev, down: -1 };
        return prev;
      });
    });

    handle('onMouseLeave').subscribe((e) => {
      setState((prev) => {
        const index = e.ctx.index;
        if (prev.down === index) prev = { ...prev, down: -1 }; // Clear the [down] state, cannot be down if mouse has "left the building".
        if (prev.over === index) prev = { ...prev, over: -1 };
        return prev;
      });
    });

    return () => events.dispose();
  }, [bus, instance]);

  return {
    bus: rx.bus.instance(bus),
    instance,
    state,
  };
}
