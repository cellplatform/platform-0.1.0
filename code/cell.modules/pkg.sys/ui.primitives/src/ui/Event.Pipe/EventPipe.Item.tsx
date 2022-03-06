import React from 'react';

import { css, CssValue } from '../../common';
import { Bullet } from '../Bullet';
import { EventHistoryItem } from '../Event/types';

export type EventPipeItemClickEvent = EventHistoryItem;
export type EventPipeItemClickEventHandler = (e: EventPipeItemClickEvent) => void;

export type EventPipeItemProps = {
  item: EventHistoryItem;
  size: number;
  parentSize: number;
  color: string | number;
  orientation: 'x' | 'y';
  style?: CssValue;
  onClick?: EventPipeItemClickEventHandler;
};

export const EventPipeItem: React.FC<EventPipeItemProps> = (props) => {
  const { item, size, orientation, parentSize, onClick } = props;

  const styles = {
    base: css({
      position: 'absolute',
      left: orientation === 'x' ? parentSize - size : undefined,
      top: orientation === 'y' ? parentSize - size : undefined,
    }),
  };
  return (
    <Bullet
      style={styles.base}
      size={size}
      body={{ backgroundColor: props.color, radius: size }}
      hover={{ over: 2, down: 1.5, duration: 100 }}
      onClick={() => onClick?.(item)}
    />
  );
};
