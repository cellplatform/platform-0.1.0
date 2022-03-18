import { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';

import { Keyboard, rx, slug, t, UIEvent } from './common';
import { ListEvents } from './Events';
import { ListMouseState } from './List.MouseState';

type Index = number;
type S = t.ListState;
type Change = {
  item: Index; // NB: -1 if state change does not originate from a specific item.
  state: S;
};

/**
 * Controller for common behavior between different kinds of list.
 */
export function useContext(args: { total: number; event?: t.ListEventArgs }) {
  const { total } = args;

  const [count, setCount] = useState(0);
  const eventRef = useRef<t.ListEventArgs>(args.event ?? dummy());
  const { instance } = eventRef.current;
  const bus = rx.busAsType<t.ListEvent>(eventRef.current.bus);

  Keyboard.useEventPipe({ bus }); // Ensure keyboard events are being piped into the bus.

  const ctx: t.CtxList = { kind: 'List', total };
  const ui = UIEvent.useEventPipe<t.CtxList, HTMLDivElement>({ bus, instance, ctx });
  const { onMouseDown, onMouseUp, onMouseEnter, onMouseLeave } = ui.mouse;
  const { onFocus, onBlur } = ui.focus;
  const isFocused = ui.element.containsFocus;

  const mouse = ListMouseState({ bus, instance });

  const changed$ = new Subject<Change>();
  const stateRef = useRef<S>({ isFocused, mouse: mouse.state });
  const setState = (item: Index, fn: (prev: S) => S) => {
    stateRef.current = fn(stateRef.current);
    changed$.next({ item, state: stateRef.current });

    if (item > -1) {
      bus.fire({
        type: 'sys.ui.List/Item/Changed',
        payload: {
          instance,
          index: item,
          state: { list: stateRef.current },
        },
      });
    }
  };

  /**
   * [ListEvents] controller.
   */
  useEffect(() => {
    const events = ListEvents({ bus, instance });

    /**
     * Force redraw.
     */
    events.redraw.$.subscribe(() => setCount((prev) => prev + 1));

    // Finish up.
    return () => events.dispose();
  }, [bus, instance]); // eslint-disable-line

  /**
   * State controller.
   */
  useEffect(() => {
    const listDOM = ui.events();
    listDOM.focus.$.subscribe((e) => {
      const { isFocused } = e;
      setState(-1, (prev) => ({ ...prev, isFocused }));
    });

    mouse.changed$.subscribe((e) => {
      const mouse = e.state;
      setState(e.item, (prev) => ({ ...prev, mouse }));
    });

    return () => listDOM.dispose();
  }, [bus, instance]); // eslint-disable-line

  return {
    redrawKey: `redraw.${count}`,
    instance,
    bus,
    changed$: changed$.asObservable(),
    get state() {
      return stateRef.current;
    },
    list: {
      ref: ui.ref,
      handlers: { onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, onFocus, onBlur },
    },
  };
}

/**
 * [Helpers]
 */

export function dummy(): t.ListEventArgs {
  return {
    bus: rx.bus(),
    instance: `list.dummy.${slug()}`,
  };
}
