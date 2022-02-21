import React from 'react';
import { defaultValue, css, CssValue, t, COLORS, ObjectView } from '../../common';

import { Card, CardProps } from '../Card';
import { PropList, PropListItem } from '../PropList';

export type EventStackCardProps = {
  count: number;
  event: t.Event<any>;
  title?: string;
  isTopCard?: boolean;
  width?: number;
  height?: number;
  shadow?: CardProps['shadow'];
  showAsCard?: boolean;
  style?: CssValue;

  showPayload?: boolean;
  onShowPayloadToggle?: () => void;
};

export const EventStackCard: React.FC<EventStackCardProps> = (props) => {
  const { event, width, height, showPayload = false, isTopCard } = props;
  const shadow = defaultValue(props.shadow);

  const styles = {
    base: css({ position: 'relative', width, height, minHeight: 40 }),
    inner: css({
      position: 'relative',
      boxSizing: 'border-box',
      margin: 10,
      marginRight: 15,
    }),
  };

  const itemStyle = {
    monospace: true,
    fontSize: 10,
    color: COLORS.PURPLE,
  };

  const items: PropListItem[] = [
    { label: 'count', value: props.count },
    {
      label: 'type',
      value: {
        data: event.type,
        clipboard: JSON.stringify(event, null, '  '),
        ...itemStyle,
      },
    },
    {
      label: 'payload',
      value: {
        data: '{object}',
        ...itemStyle,
        onClick: () => {
          if (props.onShowPayloadToggle) props.onShowPayloadToggle();
        },
      },
    },
  ];

  const elObject = showPayload && (
    <ObjectView name={'payload'} data={event?.payload} fontSize={10} />
  );

  const elBody = isTopCard && (
    <div {...styles.inner}>
      <PropList title={props.title} items={items} defaults={{ clipboard: false }} />
      {elObject}
    </div>
  );

  return (
    <Card shadow={shadow} style={styles.base} showAsCard={props.showAsCard}>
      {elBody}
    </Card>
  );
};
