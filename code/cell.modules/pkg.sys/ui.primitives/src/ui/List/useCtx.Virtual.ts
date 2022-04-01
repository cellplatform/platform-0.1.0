import { useRef, useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';

import { t } from './common';
import { ListEvents } from './Events';
import { useContext } from './useCtx';

/**
 * Controller for a virtual scrolling list.
 */
export function useVirtualContext(args: { total: number; instance?: t.ListInstance }) {
  const listRef = useRef<List>(null);
  const { total } = args;

  const ctx = useContext({ total, instance: args.instance });
  const instance = ctx.instance;

  /**
   * Event API Behavior
   */
  useEffect(() => {
    const events = ListEvents({ instance });

    /**
     * Scroll to an item.
     */
    events.scroll.$.subscribe((e) => {
      const list = listRef.current;
      if (!list) return;

      /**
       * TODO 🐷 BUG
       *    Scrolling to an item when padding to the list is set causes
       *    inaccurate measurement of where to scroll to.
       *
       *    FIX: https://github.com/bvaughn/react-window/issues/540
       */

      const { align = 'auto' } = e;
      const total = list.props.itemCount;
      const index = e.target === 'Top' ? 0 : e.target === 'Bottom' ? total - 1 : e.target;
      list?.scrollToItem(index, align);
    });

    // Finish up.
    return () => events.dispose();
  }, [listRef, instance.bus, instance.id]); // eslint-disable-line

  /**
   * API
   */
  return { ...ctx, listRef };
}
