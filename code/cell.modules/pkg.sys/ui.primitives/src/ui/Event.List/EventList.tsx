import React, { useRef } from 'react';
import { VariableSizeList as List } from 'react-window';

import { BulletList } from '../BulletList';
import { color, COLORS, css, CssValue, EventListConstants, FC, R, t } from './common';
import { EventListRow } from './EventList.Row';
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
const { ROW } = EventListConstants;

/**
 * TODO 🐷
 * - clean up
 */
const DEFAULT_COLORS: k.EventListColors = {
  typeLabel: color.alpha(COLORS.DARK, 0.75),
  margin: color.alpha(COLORS.DARK, 0.07),
  dot: {
    border: color.alpha(COLORS.DARK, 0.3),
    background: COLORS.WHITE,
  },
};

/**
 * Component
 */
export const View: React.FC<EventListProps> = (props) => {
  const { items = [] } = props;
  const colors = R.mergeDeepRight(DEFAULT_COLORS, props.colors ?? {});

  const listRef = useRef<List>(null);
  const ctrl = useController({ ...props.event, listRef });
  const instance = ctrl.instance;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    body: css({ Absolute: 0 }),
  };

  /**
   * TODO 🐷 Memoize
   *    - OR never pass arrays into lists
   *      and adopt the API pattern of the underlying virtualizer library (react-window)
   */
  const listItems = items.map((data, i): t.BulletItem => {
    return { id: `${i}`, data };
  });

  const elBody = (
    <BulletList.Virtual
      style={styles.body}
      spacing={ROW.SPACING}
      items={listItems}
      itemSize={(e) => (e.is.first ? ROW.HEIGHT : ROW.HEIGHT + ROW.SPACING)}
      renderers={{
        bullet(e) {
          return (
            <BulletList.Renderers.Bullet.ConnectorLines
              {...e}
              radius={0}
              lineWidth={2}
              lineColor={color.format(-0.1)}
            />
          );
        },
        body(e) {
          if (e.kind !== 'Default') return;

          const { index } = e;
          const { first, last } = e.is;
          const data = e.data as t.EventHistoryItem;

          return <EventListRow index={index} data={data} is={{ first, last }} />;
        },
      }}
    />
  );

  return <div {...css(styles.base, props.style)}>{elBody}</div>;
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
