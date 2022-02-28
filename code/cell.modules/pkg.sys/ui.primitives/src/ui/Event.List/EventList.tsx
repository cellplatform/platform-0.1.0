import React from 'react';

import { BulletList } from '../BulletList';
import { color, css, CssValue, EventListConstants, FC, t } from './common';
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
  style?: CssValue;
  onClick?: (e: k.EventListClicked) => void;
};

/**
 * Constants
 */
const { ROW } = EventListConstants;

/**
 * Component
 */
export const View: React.FC<EventListProps> = (props) => {
  const { items = [] } = props;
  const total = items.length;

  useController({ ...props.event });

  /**
   * [Handlers]
   */
  const getData: t.GetBulletItemData = (index) => {
    const data = items[index];
    const { id } = data;
    return { id, data };
  };

  const getSize: t.GetBulletItemSize = (e) => {
    return e.is.first ? ROW.HEIGHT : ROW.HEIGHT + ROW.SPACING;
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    body: css({ Absolute: 0 }),
  };

  const elBody = (
    <BulletList.Virtual
      style={styles.body}
      spacing={ROW.SPACING}
      items={{ total, getData, getSize }}
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
