import { domAnimation, LazyMotion, m } from 'framer-motion';
import React from 'react';

import { color, COLORS, css, CssValue } from '../../common';
import { EventLogItem } from '../Event/types';

export type EventPipeItemClickEvent = EventLogItem;
export type EventPipeItemClickEventHandler = (e: EventPipeItemClickEvent) => void;

export type EventPipeItemProps = {
  item: EventLogItem;
  size: number;
  parentSize: number;
  orientation: 'x' | 'y';
  style?: CssValue;
  onClick?: EventPipeItemClickEventHandler;
};

export const EventPipeItem: React.FC<EventPipeItemProps> = (props) => {
  const { item, size, orientation, parentSize, onClick } = props;

  const styles = {
    base: css({
      width: size,
      height: size,
      borderRadius: size,
      backgroundColor: color.format(COLORS.DARK),
      position: 'absolute',
      left: orientation === 'x' ? parentSize - size : undefined,
      top: orientation === 'y' ? parentSize - size : undefined,
    }),
  };
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        {...styles.base}
        style={{ originX: 'center', originY: 'center' }}
        whileHover={{ scale: 3, transition: { duration: 0.2 } }}
        whileTap={{ scale: 2 }}
        onClick={() => {
          if (onClick) onClick(item);
        }}
      />
    </LazyMotion>
  );
};
