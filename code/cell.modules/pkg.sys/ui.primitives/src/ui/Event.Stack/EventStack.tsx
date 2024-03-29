import React, { useState } from 'react';

import { css, CssValue, defaultValue, useResizeObserver } from '../../common';
import { CardStack, CardStackItem } from '../CardStack';
import { EventHistoryItem } from '../Event/types';
import { cardFactory as defaultCardFactory } from './EventStack.factory';
import { EventStackCardFactory } from './types';

/**
 * Types
 */
export type EventStackProps = {
  events?: EventHistoryItem[];
  card?: { title?: string; factory?: EventStackCardFactory; maxDepth?: number; duration?: number };
  style?: CssValue;
};

/**
 * Component
 */
export const EventStack: React.FC<EventStackProps> = (props) => {
  const { events = [] } = props;

  const card = {
    title: props.card?.title,
    factory: props.card?.factory || defaultCardFactory,
    maxDepth: defaultValue(props.card?.maxDepth, 3),
    duration: defaultValue(props.card?.duration, 300),
  };

  const size = useResizeObserver();
  const [showPayload, setShowPayload] = useState<boolean>(false);
  const toggleShowPayload = () => setShowPayload((prev) => !prev);

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      Flex: 'horizontal-center-center',
    }),
  };

  const items: CardStackItem[] = (size.ready ? events : []).map((item, i) => {
    const isTopCard = i === events.length - 1;
    const { id } = item;
    const { width } = size.rect;
    const title = card.title;
    const el = card.factory({ ...item, title, showPayload, toggleShowPayload, width, isTopCard });
    return { id, el };
  });

  return (
    <div ref={size.ref} {...css(styles.base, props.style)}>
      {size.ready && <CardStack items={items} maxDepth={card.maxDepth} duration={card.duration} />}
    </div>
  );
};
