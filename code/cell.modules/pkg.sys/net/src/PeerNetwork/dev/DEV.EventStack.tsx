import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CardStack, CardStackItem, css, CssValue, slug, t } from './common';
import { EventCard } from './DEV.EventCard';

export type EventStackProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const EventStack: React.FC<EventStackProps> = (props) => {
  const { bus } = props;

  const [events, setEvents] = useState<{ id: string; event: t.Event; count: number }[]>([]);
  const [showPayload, setShowPayload] = useState<boolean>(false);
  const toggleShowPayload = () => setShowPayload((prev) => !prev);

  useEffect(() => {
    const dispose$ = new Subject<void>();
    let count = 0;

    bus.event$.pipe(takeUntil(dispose$)).subscribe((event) => {
      count++;
      setEvents((prev) => {
        const MAX = 10;
        const events = [...prev, { id: slug(), event, count }];
        return events.length > MAX ? events.slice(events.length - MAX) : events;
      });
    });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      boxSizing: 'border-box',
      Flex: 'horizontal-center-center',
    }),
  };

  if (events.length === 0) return null;

  const items: CardStackItem[] = events.map((item, i) => {
    const { id, event, count } = item;
    const el = (
      <EventCard
        key={id}
        count={count}
        event={event}
        showPayload={showPayload}
        onToggleShowPayload={toggleShowPayload}
      />
    );

    return { id, el };
  });

  return (
    <div {...css(styles.base, props.style)}>
      <CardStack items={items} maxDepth={3} style={{ flex: 1 }} />
    </div>
  );
};
