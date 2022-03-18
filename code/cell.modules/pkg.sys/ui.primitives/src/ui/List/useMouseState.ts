import { useEffect, useState } from 'react';

import { rx, t } from './common';
import { ListMouseState } from './List.MouseState';

/**
 * Maintains state of mouse over the set of <List> items.
 */
export function useMouseState(args: t.ListEventArgs) {
  const { bus, instance } = args;
  const [state, setState] = useState<t.ListMouseState>({ over: -1, down: -1 });

  useEffect(() => {
    const mouse = ListMouseState({ bus, instance });
    mouse.changed$.subscribe((e) => setState(e));
    return () => mouse.dispose();
  }, [bus, instance]);

  return {
    bus: rx.bus.instance(bus),
    instance,
    state,
  };
}
