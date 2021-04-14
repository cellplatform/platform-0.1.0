import React, { useRef, useState } from 'react';

import { css, CssValue, defaultValue, useResizeObserver } from '../../common';
import { CardStack, CardStackItem } from '../CardStack';
import { cardFactory as defaultCardFactory } from './EventStack.factory';
import { EventHistoryItem } from '../Event/types';
import { EventStackCardFactory } from './types';

export type EventStackProps = {
  events?: EventHistoryItem[];
  card?: { factory?: EventStackCardFactory; maxDepth?: number };
  style?: CssValue;
};

export const EventStack: React.FC<EventStackProps> = (props) => {
  const { events = [] } = props;
  const cardFactory = props.card?.factory || defaultCardFactory;
  const maxCardDepth = defaultValue(props.card?.maxDepth, 3);

  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef);

  const [showPayload, setShowPayload] = useState<boolean>(false);
  const toggleShowPayload = () => setShowPayload((prev) => !prev);

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
      {resize.ready && <CardStack items={items} maxDepth={maxCardDepth} />}
    </div>
  );
};
