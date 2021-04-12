import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, slug, t, useResizeObserver, defaultValue } from '../../common';
import { CardStack, CardStackItem } from '../CardStack';
import { EventStackCard } from '../EventStack.Card';

export type EventStackEvent = { id: string; event: t.Event; count: number };
export type EventStackCardFactoryArgs = EventStackEvent & {
  width: number;
  isTopCard: boolean;
  showPayload?: boolean;
  toggleShowPayload?: () => void;
};

export type EventStackProps = {
  bus: t.EventBus<any>;
  cardFactory?: (args: EventStackCardFactoryArgs) => JSX.Element;
  maxDepth?: number;
  style?: CssValue;
};

const Default = {
  cardCactory(args: EventStackCardFactoryArgs) {
    return (
      <EventStackCard
        key={args.id}
        count={args.count}
        event={args.event}
        width={args.width}
        isTopCard={args.isTopCard}
        showPayload={args.showPayload}
        onShowPayloadToggle={args.toggleShowPayload}
      />
    );
  },
};

export const EventStack: React.FC<EventStackProps> = (props) => {
  const { bus, cardFactory = Default.cardCactory } = props;
  const maxDepth = defaultValue(props.maxDepth, 3);

  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef);

  const [events, setEvents] = useState<EventStackEvent[]>([]);
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
      position: 'relative',
      boxSizing: 'border-box',
      Flex: 'horizontal-center-center',
    }),
  };

  const items: CardStackItem[] = (resize.ready ? events : []).map((item, i) => {
    const isTopCard = i === events.length - 1;
    const { id } = item;
    const { width } = resize.rect;
    const el = cardFactory({ ...item, showPayload, toggleShowPayload, width, isTopCard });
    return { id, el };
  });

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {resize.ready && <CardStack items={items} maxDepth={maxDepth} />}
    </div>
  );
};
