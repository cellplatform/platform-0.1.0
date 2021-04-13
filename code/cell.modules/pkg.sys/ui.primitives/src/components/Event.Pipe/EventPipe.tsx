import { AnimatePresence, domMax, LazyMotion, m } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import {
  color,
  COLORS,
  css,
  CssValue,
  defaultValue,
  deleteUndefined,
  useResizeObserver,
} from '../../common';
import { EventLogItem } from '../Event/types';

export type EventPipeProps = {
  events?: EventLogItem[];
  backgroundColor?: string | number;
  event?: { color?: string | number; max?: number };
  orientation?: 'x' | 'y';
  thickness?: number;
  duration?: number; // msecs
  style?: CssValue;
};

export const EventPipe: React.FC<EventPipeProps> = (props) => {
  const { orientation = 'x', thickness = 8, backgroundColor = -0.06 } = props;
  const duration = defaultValue(props.duration, 300) / 1000;
  const max = defaultValue(props.event?.max, 10);

  let events = props.events || [];
  if (events.length > max) {
    events = events.slice(events.length - max);
  }

  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef);
  const isReady = resize.ready;
  const baseOffset = orientation === 'x' ? resize.rect.width : resize.rect.height;
  const eventColor = defaultValue(props.event?.color, COLORS.DARK);

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      backgroundColor: color.format(backgroundColor),
      height: orientation === 'x' ? thickness : undefined,
      width: orientation === 'y' ? thickness : undefined,
      borderRadius: thickness,
    }),
    event: {
      base: css({
        width: thickness,
        height: thickness,
        borderRadius: thickness,
        backgroundColor: color.format(eventColor),

        position: 'absolute',
        left: orientation === 'x' ? baseOffset - thickness : undefined,
        top: orientation === 'y' ? baseOffset - thickness : undefined,
      }),
    },
  };

  const elEvents = (isReady ? events : []).map((item, i) => {
    const total = events.length;
    const position = total - i - 1;
    const space = baseOffset / (max - 3);

    const offset = 0 - position * space;
    const x = orientation === 'x' ? offset : undefined;
    const y = orientation === 'y' ? offset : undefined;

    const percent = position * 0.15;
    const opacity = 1 - percent;
    const animate = deleteUndefined({ x, y, opacity });

    return (
      <m.div key={item.id} animate={animate} transition={{ duration }} exit={{ opacity: 0 }}>
        <div {...css(styles.event.base)}></div>
      </m.div>
    );
  });

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      <LazyMotion features={domMax}>
        <AnimatePresence>{isReady ? elEvents : []}</AnimatePresence>
      </LazyMotion>
    </div>
  );
};
