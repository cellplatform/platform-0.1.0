import React, { useEffect, useState } from 'react';

import { Card, css, CssValue, ObjectView, PropList, PropListItem, t } from './common';

export type EventCardProps = {
  count: number;
  event: t.Event<any>;
  style?: CssValue;
  showPayload?: boolean;
  onToggleShowPayload?: () => void;
};

export const EventCard: React.FC<EventCardProps> = (props) => {
  const { event, showPayload = false } = props;
  const styles = { base: css({}) };
  const items: PropListItem[] = [
    { label: 'count', value: props.count },
    {
      label: 'type',
      value: { data: event.type, clipboard: JSON.stringify(event, null, '  ') },
    },
    {
      label: 'payload',
      value: {
        data: '{object}',
        monospace: true,
        onClick: () => {
          console.log('click', event);
          if (props.onToggleShowPayload) props.onToggleShowPayload();
        },
      },
    },
  ];

  const elObject = showPayload && (
    <ObjectView name={'payload'} data={event?.payload} fontSize={10} />
  );

  return (
    <Card padding={[10, 15, 10, 10]} width={{ min: 235 }} shadow={false} style={styles.base}>
      <PropList title={'Network Bus'} items={items} defaults={{ clipboard: false }} />
      {elObject}
    </Card>
  );
};
