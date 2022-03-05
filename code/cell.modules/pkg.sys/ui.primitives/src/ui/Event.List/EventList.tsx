import React, { useState, useRef } from 'react';

import { BulletList } from '../BulletList';
import { color, css, CssValue, EventListConstants, FC, t } from './common';
import { EventListRow } from './EventList.Row';
import { useController } from './EventList.useController';
import { EventListEvents } from './Events';
import * as k from './types';

import { EventCard } from '../Event.Card';

import { useClickOutside } from '@platform/react/lib/hooks';

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

  const baseRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [showPayload, setShowPayload] = useState(false);

  useController({ ...props.event });
  useClickOutside('down', baseRef, () => setSelectedIndex(undefined));

  /**
   * [Handlers]
   */
  const getData: t.GetBulletItem = (index) => {
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
    base: css({
      position: 'relative',
      Flex: 'y-stretch-stretch',
      boxSizing: 'border-box',
    }),
    list: {
      base: css({ flex: 1, position: 'relative' }),
      body: css({ Absolute: [0, 0, 0, 12] }),
    },
    selected: {
      base: css({ position: 'relative', paddingRight: 12 }),
    },
  };

  const selectedItem = items[selectedIndex ?? 0];
  const elSelected = selectedItem && (
    <div {...styles.selected.base}>
      <EventCard
        event={selectedItem.event}
        count={selectedItem.count}
        showPayload={showPayload}
        onShowPayloadToggle={() => setShowPayload((prev) => !prev)}
      />
    </div>
  );

  const elList = (
    <div {...styles.list.base}>
      <BulletList.Virtual
        style={styles.list.body}
        spacing={ROW.SPACING}
        items={{ total, getData, getSize }}
        paddingNear={10}
        renderers={{
          bullet(e) {
            return (
              <BulletList.Renderers.Bullet.ConnectorLines
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
      {elSelected}
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
export const EventList = FC.decorate<EventListProps, Fields>(View, {
  Events: EventListEvents,
});
