import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, slug, t, useResizeObserver, defaultValue } from '../../common';
import { CardStack, CardStackItem } from '../CardStack';
import { EventStackCard } from '../EventStack.Card';

export type EventStackEvent = { id: string; event: t.Event; count: number };
export type EventStackFactoryArgs = EventStackEvent & {
  width: number;
  showPayload?: boolean;
  toggleShowPayload?: () => void;
};

export type EventStackProps = {
  bus: t.EventBus<any>;
  factory?: (args: EventStackFactoryArgs) => JSX.Element;
  maxDepth?: number;
  style?: CssValue;
};

const Default = {
  factory(args: EventStackFactoryArgs) {
    return (
      <EventStackCard
        key={args.id}
        count={args.count}
        event={args.event}
        showPayload={args.showPayload}
        width={args.width}
        onShowPayloadToggle={args.toggleShowPayload}
      />
    );
  },
};

export const EventStack: React.FC<EventStackProps> = (props) => {
  const { bus, factory = Default.factory } = props;
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

  const items: CardStackItem[] = (resize.ready ? events : []).map((item) => {
    const { id } = item;
    const { width } = resize.rect;
    const el = factory({ ...item, showPayload, toggleShowPayload, width });
    return { id, el };
  });

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      {resize.ready && <CardStack items={items} maxDepth={maxDepth} />}
    </div>
  );
};
