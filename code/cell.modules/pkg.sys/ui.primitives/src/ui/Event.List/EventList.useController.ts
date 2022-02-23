import React, { useEffect } from 'react';
import { VariableSizeList as List } from 'react-window';

import { rx, t } from './common';
import { EventListEvents } from './Events';
import * as k from './types';

/**
 * Event behavior controller.
 */
export function useController(args: {
  listRef: React.RefObject<List>;
  bus?: t.EventBus<any>;
  instance?: string;
}) {
  const { listRef, instance = 'default' } = args;
  const bus = rx.busAsType<k.EventListEvent>(args.bus || rx.bus());

  /**
   * Lifecycle.
   */
  useEffect(() => {
    const events = EventListEvents({ bus, instance });

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

    return () => events.dispose();
  }, [listRef, bus, instance]); // eslint-disable-line

  return {
    instance,
    bus,
  };
}
