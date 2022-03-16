import { useEffect, useRef, useState } from 'react';

import { Keyboard, rx, slug, t, UIEvent } from './common';
import { ListEvents } from './Events';
import { useMouseState } from './useMouseState';

/**
 * Controller for common behavior between different kinds of list.
 */
export function useContext(args: { total: number; event?: t.ListEventArgs }) {
  const { total } = args;

  const [count, setCount] = useState(0);
  const eventRef = useRef<t.ListEventArgs>(args.event ?? dummy());
  const { bus, instance } = eventRef.current;

  Keyboard.useEventPipe({ bus }); // Ensure keyboard events are being piped into the bus.

  const ctx: t.CtxList = { kind: 'List', total };
  const ui = UIEvent.useEventPipe<t.CtxList, HTMLDivElement>({
    bus,
    instance,
    ctx,
    redrawOnFocus: true,
  });

  const isFocused = ui.element.containsFocus;
  const mouse = useMouseState({ bus, instance });
  const state: t.ListState = { isFocused, mouse: mouse.state };

  /**
   * Lifecycle.
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

  return {
    redrawKey: `redraw.${count}`,
    instance,
    bus,
    state,
    ui,
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
