import { useEffect, useRef, useState } from 'react';

import { Keyboard, rx, slug, t, UIEvent } from './common';
import { ListEvents } from './Events';

/**
 * Controller for common behavior between different kinds of list.
 */
export function useContext(args: { total: number; event?: t.ListBusArgs }) {
  const { total } = args;

  const [count, setCount] = useState(0);
  const eventRef = useRef<t.ListBusArgs>(args.event ?? dummy());
  const { instance } = eventRef.current;
  const bus = rx.busAsType<t.ListEvent>(eventRef.current.bus);

  Keyboard.useEventPipe({ bus }); // Ensure keyboard events are being piped into the bus.

  const ctx: t.CtxList = { kind: 'List', total };
  const ui = UIEvent.useEventPipe<t.CtxList, HTMLDivElement>({ bus, instance, ctx });
  const { onMouseDown, onMouseUp, onMouseEnter, onMouseLeave } = ui.mouse;
  const { onFocus, onBlur } = ui.focus;

  /**
   * [ListEvents] controller.
   */
  useEffect(() => {
    const events = ListEvents({ bus, instance });

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
  }, [bus, instance]); // eslint-disable-line

  return {
    bus,
    instance,
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

export function dummy(): t.ListBusArgs {
  return {
    bus: rx.bus(),
    instance: `list.dummy.${slug()}`,
  };
}
