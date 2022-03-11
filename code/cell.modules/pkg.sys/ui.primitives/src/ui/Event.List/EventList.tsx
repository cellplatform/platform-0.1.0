import { useClickOutside } from '@platform/react/lib/hooks';
import React, { useRef, useState } from 'react';

import { List } from '../List';
import { color, COLORS, css, CssValue, EventListConstants, FC, rx, t } from './common';
import { EventListHeader } from './EventList.Header';
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
  showBusId?: boolean;
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

  const baseRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();

  const ctrl = useController({ ...props.event });
  useClickOutside('down', baseRef, () => setSelectedIndex(undefined));

  const { bus, instance } = ctrl;
  const selectedItem = items[selectedIndex ?? 0];

  /**
   * [Handlers]
   */
  const getData: t.GetListItem = (index) => {
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
    base: css({
      position: 'relative',
      Flex: 'y-stretch-stretch',
      boxSizing: 'border-box',
      color: COLORS.DARK,
    }),
    header: css({ marginRight: 12 }),
    list: {
      base: css({ flex: 1, position: 'relative' }),
      body: css({ Absolute: [0, 0, 0, 12] }),
    },
  };

  const elHeader = selectedItem && (
    <EventListHeader
      items={[selectedItem]}
      total={total}
      busId={props.showBusId ? rx.bus.instance(bus) : undefined}
      style={styles.header}
    />
  );

  const elList = (
    <div {...styles.list.base}>
      <List.Virtual
        style={styles.list.body}
        spacing={ROW.SPACING}
        items={{ total, getData, getSize }}
        paddingNear={10}
        renderers={{
          bullet(e) {
            return (
              <List.Renderers.Bullet.ConnectorLines
                {...e}
                radius={4}
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
            const selected = selectedIndex === undefined ? undefined : index === selectedIndex;

            return (
              <EventListRow
                index={index}
                data={data}
                is={{ first, last, selected }}
                onClick={(e) => setSelectedIndex(e.index)}
              />
            );
          },
        }}
      />
    </div>
  );

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {elHeader}
      {elList}
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  Events: k.EventListEventsFactory;
};
export const EventList = FC.decorate<EventListProps, Fields>(
  View,
  { Events: EventListEvents },
  { displayName: 'EventList' },
);
