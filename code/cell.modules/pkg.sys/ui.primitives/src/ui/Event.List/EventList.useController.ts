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
  const { listRef, instance = 'inactive' } = args;
  const bus = rx.busAsType<k.EventListEvent>(args.bus || rx.bus());

  /**
   * Lifecycle.
   */
  useEffect(() => {
    console.log('init');

    const events = EventListEvents({ bus, instance });

    events.scroll.$.subscribe((e) => {
      const list = listRef.current;
      if (!list) return;

      const total = list.props.itemCount;
      const { align = 'auto' } = e;
      const index = e.target === 'Top' ? 0 : e.target === 'Bottom' ? total - 1 : e.target;

      // console.log('getTotal()', getTotal());
      console.log('index', index);

      console.log('list', listRef);
      console.log('list', list);
      console.log('list', list.context);

      list?.scrollToItem(index, align);

      // list?.
    });

    return () => events.dispose();
  }, [listRef, bus, instance]); // eslint-disable-line

  return {};
}
