import { useRef, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';

import { t } from './common';
import { ListEvents } from './Events';
import { useContext } from './useCtx';

/**
 * Controller for a virtual scrolling list.
 */
export function useVirtualContext(args: { total: number; event?: t.ListBusArgs }) {
  const listRef = useRef<List>(null);
  const { total, event } = args;

  const ctx = useContext({ total, event });
  const { bus, instance } = ctx;

  /**
   * Event API Behavior
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

    // Finish up.
    return () => events.dispose();
  }, [listRef, bus, instance]); // eslint-disable-line

  /**
   * API
   */
  return { ...ctx, listRef };
}
