import { useRef, useEffect, useState } from 'react';
import { VariableSizeList as List } from 'react-window';

import { t, eventDummy } from './common';
import { ListEvents } from './Events';

/**
 * Event behavior controller.
 */
export function useListVirtualController(args: { event?: t.ListEventArgs }) {
  const eventRef = useRef<t.ListEventArgs>(args.event ?? eventDummy());
  const listRef = useRef<List>(null);
  const [count, setCount] = useState(0);

  const { bus, instance } = eventRef.current;

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

      const { align = 'auto' } = e;
      const total = list.props.itemCount;
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
    key: `redraw.${count}`,
    listRef,
    instance,
    bus,
  };
}
