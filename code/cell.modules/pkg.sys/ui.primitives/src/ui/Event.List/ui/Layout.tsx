import React from 'react';

import { List } from '../../List';
import { color, CONSTANTS, css, CssValue, t } from '../common';
import { EventListRow } from './Row';

/**
 * Types
 */
export type EventListLayoutProps = {
  event: t.EventListInstance;
  items: t.EventHistoryItem[];
  debug?: t.EventListDebugProps;
  style?: CssValue;
};

/**
 * Constants
 */
const { ROW, LIST } = CONSTANTS;

/**
 * Component
 */
export const EventListLayout: React.FC<EventListLayoutProps> = (props) => {
  const { items = [], debug = {} } = props;
  const { bus, id: instance } = props.event;
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
        instance={{ bus, id: instance }}
        cursor={{ total, getData, getSize }}
        spacing={ROW.SPACING}
        orientation={'y'}
        paddingNear={0}
        paddingFar={LIST.PADDING.RIGHT}
        bullet={{ size: 8 }}
        debug={{ tracelines: debug.tracelines }}
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
