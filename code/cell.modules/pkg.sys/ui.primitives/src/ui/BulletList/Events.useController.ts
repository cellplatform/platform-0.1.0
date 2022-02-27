import React, { useEffect, useState } from 'react';
import { VariableSizeList as List } from 'react-window';

import { rx, t } from './common';
import { BulletListEvents } from './Events';
import * as k from './types';

/**
 * Event behavior controller.
 */
export function useEventsController(args: {
  listRef: React.RefObject<List>;
  bus?: t.EventBus<any>;
  instance?: string;
}) {
  const { listRef, instance = 'default' } = args;
  const bus = rx.busAsType<k.BulletListEvent>(args.bus || rx.bus());

  const [count, setCount] = useState(0);

  /**
   * Lifecycle.
   */
  useEffect(() => {
    const events = BulletListEvents({ bus, instance });

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
    instance,
    bus,
    key: `redraw.${count}`,
  };
}