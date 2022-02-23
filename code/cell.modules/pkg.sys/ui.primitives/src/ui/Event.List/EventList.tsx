import React, { useRef } from 'react';
import { VariableSizeList as List } from 'react-window';

import { color, COLORS, css, CssValue, FC, R, t, useResizeObserver } from './common';
import { EventListRow, EventListRowData } from './EventList.Row';
import { useController } from './EventList.useController';
import { EventListEvents } from './Events';
import * as k from './types';

/**
 * Types
 */
export type EventListProps = {
  event?: { bus: t.EventBus<any>; instance: string };
  items?: t.EventHistoryItem[];
  colors?: t.PartialDeep<k.EventListColors>;
  style?: CssValue;
  onClick?: (e: k.EventListClicked) => void;
};

/**
 * Constants
 */
const DEFAULT_COLORS: k.EventListColors = {
  margin: color.alpha(COLORS.DARK, 0.4),
  typeLabel: color.alpha(COLORS.DARK, 0.8),
};

/**
 * Component
 */
export const View: React.FC<EventListProps> = (props) => {
  const { items = [] } = props;
  const colors = R.mergeDeepRight(DEFAULT_COLORS, props.colors ?? {});

  const rootRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(rootRef);
  const size = resize.rect;

  const listRef = useRef<List>(null);
  const ctrl = useController({ ...props.event, listRef });
  const instance = ctrl.instance;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    bg: {
      base: css({ Absolute: 0 }),
      margin: css({
        width: 1,
        Absolute: [0, null, 0, 8],
        backgroundColor: color.format(colors.margin),
      }),
    },
    body: css({ Absolute: 0 }),
  };

  const getItemSize = (index: number) => 20;
  const getItemData = (index: number): EventListRowData | undefined => {
    const item = items[index];
    const onClick = (e: k.EventListClicked) => {
      props.onClick?.(e);
      ctrl.bus.fire({
        type: 'sys.ui.EventList/Clicked',
        payload: { instance, index, item },
      });
    };

    return !item ? undefined : { instance, item, colors, onClick };
  };

  const elBackground = (
    <div {...styles.bg.base}>
      <div {...styles.bg.margin} />
    </div>
  );

  const elBody = (
    <div>
      <List
        ref={listRef}
        width={size.width}
        height={size.height}
        itemCount={items.length}
        itemSize={getItemSize}
        itemData={getItemData}
        itemKey={(index: number) => items[index]?.id}
      >
        {EventListRow}
      </List>
    </div>
  );

  return (
    <div ref={rootRef} {...css(styles.base, props.style)}>
      {elBackground}
      {resize.ready && elBody}
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  Events: k.EventListEventsFactory;
};
export const EventList = FC.decorate<EventListProps, Fields>(View, {
  Events: EventListEvents,
});
