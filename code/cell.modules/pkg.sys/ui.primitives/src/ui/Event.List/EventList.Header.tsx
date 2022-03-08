import React, { useState } from 'react';

import { EventCard } from '../Event.Card';
import { TextCopy } from '../Text.Copy';
import { color, css, CssValue, FC, t } from './common';

export type EventListHeaderProps = {
  items: t.EventHistoryItem[];
  total: number;
  defaultShowPayload?: boolean;
  busId?: string;
  style?: CssValue;
};

export const EventListHeader: React.FC<EventListHeaderProps> = (props) => {
  const { items } = props;
  const [showPayload, setShowPayload] = useState(props.defaultShowPayload ?? false);

  /**
   * TODO 🐷
   * - handle multi-selection.
   */
  const TMP = items[0];

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Flex: 'y-stretch-stretch',
    }),
    busIdentifier: css({
      Flex: `x-spaceBetween-center`,
      PaddingY: 3,
      fontSize: 9,
      color: color.format(-0.3),
    }),
  };

  const elCard = (
    <EventCard
      event={TMP.event}
      count={TMP.count}
      showPayload={showPayload}
      onShowPayloadToggle={() => setShowPayload((prev) => !prev)}
    />
  );

  const elMeta = props.busId && (
    <div {...styles.busIdentifier}>
      <div />
      <TextCopy
        icon={{ element: <TextCopy.Icon size={10} color={-0.4} /> }}
        onCopy={(e) => e.copy(`EventBus Instance: ${props.busId || ''}`)}
        style={{ marginRight: 4 }}
      >
        {props.busId}
      </TextCopy>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elCard}
      {elMeta}
    </div>
  );
};
