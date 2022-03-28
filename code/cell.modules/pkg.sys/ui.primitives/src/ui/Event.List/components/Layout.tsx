import React from 'react';

import { List } from '../../List';
import { color, CONSTANTS, css, CssValue, t } from '../common';
import { EventListRow } from './Layout.Row';

type Id = string;

/**
 * Types
 */
export type EventListLayoutProps = {
  event: { bus: t.EventBus<any>; instance: Id }; // Internal component event-bus.
  items: t.EventHistoryItem[];
  style?: CssValue;
};

/**
 * Constants
 */
const { ROW } = CONSTANTS;

/**
 * Component
 */
export const EventListLayout: React.FC<EventListLayoutProps> = (props) => {
  const { bus, instance } = props.event;
  const { items = [] } = props;
  const total = items.length;

  /**
   * [Handlers]
   */
  const getData: t.GetListItem = (index) => {
    // NB: Reverse the list (order: highest-lowest, new items at the top).
    index = total - 1 - index;
    const data = items[index];
    const { id } = data;
    return { id, data };
  };

  const getSize: t.GetListItemSize = (e) => {
    return e.is.first ? ROW.HEIGHT : ROW.HEIGHT + ROW.SPACING;
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    body: css({ Absolute: 0 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <List.Virtual
        style={styles.body}
        event={{ bus, instance }}
        items={{ total, getData, getSize }}
        spacing={ROW.SPACING}
        orientation={'y'}
        paddingNear={0}
        paddingFar={10}
        bullet={{ size: 8 }}
        renderers={{
          bullet(e) {
            return (
              <List.Renderers.Bullet.ConnectorLines
                {...e}
                radius={6}
                lineWidth={2}
                lineColor={color.format(-0.1)}
              />
            );
          },
          body(e) {
            if (e.kind !== 'Default') return;

            const { index } = e;
            const { first, last, selected, mouse } = e.is;
            const down = mouse.down;
            const data = e.data as t.EventHistoryItem;

            return (
              <EventListRow
                index={index}
                data={data}
                is={{ first, last, selected, down }}
                // onClick={(e) => setSelectedIndex(e.index)}
              />
            );
          },
        }}
      />
    </div>
  );
};
