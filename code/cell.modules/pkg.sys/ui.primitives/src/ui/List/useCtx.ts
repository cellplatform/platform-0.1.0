import { useEffect, useRef, useState } from 'react';

import { Keyboard, rx, slug, t, UIEvent } from './common';
import { ListEvents } from './Events';

/**
 * Controller for common behavior between different kinds of list.
 */
export function useContext(args: { total: number; instance?: t.ListInstance }) {
  const { total } = args;

  const [count, setCount] = useState(0);
  const instanceRef = useRef<t.ListInstance>(args.instance ?? dummyInstance());
  const id = instanceRef.current.id;
  const bus = rx.busAsType<t.ListEvent>(instanceRef.current.bus);

  Keyboard.useEventPipe({ bus }); // Ensure keyboard events are being piped into the bus.

  const ctx: t.CtxList = { kind: 'List', total };
  const ui = UIEvent.useEventPipe<t.CtxList, HTMLDivElement>({ bus, instance: id, ctx });
  const { onMouseDown, onMouseUp, onMouseEnter, onMouseLeave } = ui.mouse;
  const { onFocus, onBlur } = ui.focus;

  /**
   * [ListEvents] controller.
   */
  useEffect(() => {
    const events = ListEvents({ instance: { bus, id } });

    /**
     * Force redraw.
     */
    events.redraw.$.subscribe(() => setCount((prev) => prev + 1));

    /**
     * Focus / Blur.
     */
    events.focus.$.subscribe((e) => {
      const el = ui.ref.current;
      if (e.focus) el?.focus();
      if (!e.focus) el?.blur();
    });

    // Finish up.
    return () => events.dispose();
  }, [bus, id]); // eslint-disable-line

  return {
    instance: { bus, id },
    redrawKey: `redraw.${count}`,
    list: {
      ref: ui.ref,
      handlers: { onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, onFocus, onBlur },
    },
  };
}

/**
 * [Helpers]
 */

export function dummyInstance(): t.ListInstance {
  return {
    bus: rx.bus(),
    id: `list.dummy.${slug()}`,
  };
}
