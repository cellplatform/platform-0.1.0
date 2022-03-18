import { Subject, takeUntil } from 'rxjs';

import { rx, t, UIEvent } from './common';

type Index = number;
type S = t.ListMouseState;
type Change = { item: Index; state: S };

/**
 * Maintains state of mouse over the set of <List> items.
 */
export function ListMouseState(args: t.ListEventArgs) {
  const { bus, instance } = args;

  const events = UIEvent.Events<t.CtxItem>({
    bus,
    instance,
    filter: (e) => e.payload.ctx.kind === 'Item',
  });
  const { dispose, dispose$, mouse } = events;

  let state: S = { over: -1, down: -1 };
  const changed$ = new Subject<Change>();
  const setState = (item: Index, fn: (prev: S) => S) => {
    state = fn(state);
    changed$.next({ item, state });
  };

  /**
   * Mouse state.
   */
  mouse.event('onMouseEnter').subscribe((e) => {
    const { index } = e.ctx;
    setState(index, (prev) => ({ ...prev, over: e.ctx.index }));
  });

  mouse
    .filter(UIEvent.isLeftButton)
    .event('onMouseDown')
    .subscribe((e) => {
      const { index } = e.ctx;
      setState(index, (prev) => ({ ...prev, down: e.ctx.index }));
    });

  mouse
    .filter(UIEvent.isLeftButton)
    .event('onMouseUp')
    .subscribe((e) => {
      const { index } = e.ctx;
      setState(index, (prev) => {
        if (prev.down === e.ctx.index) prev = { ...prev, down: -1 };
        return prev;
      });
    });

  mouse.event('onMouseLeave').subscribe((e) => {
    const { index } = e.ctx;
    setState(index, (prev) => {
      const index = e.ctx.index;
      if (prev.down === index) prev = { ...prev, down: -1 }; // Clear the [down] state, cannot be down if mouse has "left the building".
      if (prev.over === index) prev = { ...prev, over: -1 };
      return prev;
    });
  });

  /**
   * API
   */
  return {
    bus: rx.bus.instance(bus),
    instance,
    dispose,
    dispose$,
    changed$: changed$.pipe(takeUntil(dispose$)),
    get state() {
      return state;
    },
  };
}
