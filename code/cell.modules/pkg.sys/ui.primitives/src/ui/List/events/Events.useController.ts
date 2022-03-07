import { useRef, useEffect, useState } from 'react';
import { VariableSizeList as List } from 'react-window';

import { rx, t, k } from '../common';
import { ListEvents } from './Events';

/**
 * Event behavior controller.
 */
export function useEventsController(args: { bus?: t.EventBus<any>; instance?: string }) {
  const { instance = 'default' } = args;
  const bus = rx.busAsType<k.ListEvent>(args.bus || rx.bus());

  const listRef = useRef<List>(null);
  const [count, setCount] = useState(0);

  /**
   * Lifecycle.
   */
  useEffect(() => {
    const events = ListEvents({ bus, instance });

    /**
     * Scroll to an item.
     */
    events.scroll.$.subscribe((e) => {
      const list = listRef.current;
      if (!list) return;

      const total = list.props.itemCount;
      const { align = 'auto' } = e;
      const index = e.target === 'Top' ? 0 : e.target === 'Bottom' ? total - 1 : e.target;
      list?.scrollToItem(index, align);
    });

    /**
     * Force redraw.
     */
    events.redraw.$.subscribe(() => setCount((prev) => prev + 1));

    // Finish up.
    return () => events.dispose();
  }, [listRef, bus, instance]); // eslint-disable-line

  return {
    listRef,
    instance,
    bus,
    key: `redraw.${count}`,
  };
}
