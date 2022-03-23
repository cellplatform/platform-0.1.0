import React from 'react';

import { List } from '../List';
import { color, css, CssValue, EventListConstants, t } from './common';
import { EventListRow } from './EventList.Layout.Row';

type Id = string;

export type EventListLayoutProps = {
  event: { bus: t.EventBus<any>; instance: Id }; // Internal component event-bus.
  items: t.EventHistoryItem[];
  selection?: t.ListSelectionState;
  style?: CssValue;
};

/**
 * Constants
 */
const { ROW } = EventListConstants;

export const EventListLayout: React.FC<EventListLayoutProps> = (props) => {
  const { bus, instance } = props.event;
  const { items = [], selection } = props;
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
    body: css({ Absolute: [0, 0, 0, 12] }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <List.Virtual
        event={{ bus, instance }}
        style={styles.body}
        spacing={ROW.SPACING}
        items={{ total, getData, getSize }}
        orientation={'y'}
        paddingNear={10}
        paddingFar={10}
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
            // const selected = selectedIndex === undefined ? undefined : index === selectedIndex;

            // e.is.m

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
