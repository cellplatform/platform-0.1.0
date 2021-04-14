import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import React, { useRef } from 'react';

import {
  color,
  css,
  CssValue,
  defaultValue,
  deleteUndefined,
  useResizeObserver,
} from '../../common';
import { EventLogItem } from '../Event/types';
import {
  EventPipeItem,
  EventPipeItemClickEvent,
  EventPipeItemClickEventHandler,
} from './EventPipe.Item';

export { EventPipeItemClickEventHandler, EventPipeItemClickEvent };

export type EventPipeProps = {
  events?: EventLogItem[];
  backgroundColor?: string | number;
  event?: { max?: number };
  orientation?: 'x' | 'y';
  thickness?: number;
  duration?: { slide?: number }; // msecs
  style?: CssValue;
  onEventClick?: EventPipeItemClickEventHandler;
};

export const EventPipe: React.FC<EventPipeProps> = (props) => {
  const { orientation = 'x', thickness = 8, backgroundColor = -0.06 } = props;
  const slideDuration = defaultValue(props.duration?.slide, 300) / 1000;
  const max = defaultValue(props.event?.max, 10);

  let events = props.events || [];
  if (events.length > max) {
    events = events.slice(events.length - max);
  }

  const baseRef = useRef<HTMLDivElement>(null);
  const resize = useResizeObserver(baseRef);
  const isReady = resize.ready;
  const baseSize = orientation === 'x' ? resize.rect.width : resize.rect.height;

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      backgroundColor: color.format(backgroundColor),
      height: orientation === 'x' ? thickness : undefined,
      width: orientation === 'y' ? thickness : undefined,
      borderRadius: thickness,
    }),
  };

  const elEvents = (isReady ? events : []).map((item, i) => {
    const total = events.length;
    const position = total - i - 1;
    const space = baseSize / (max - 3);

    const offset = 0 - position * space;
    const x = orientation === 'x' ? offset : undefined;
    const y = orientation === 'y' ? offset : undefined;

    const percent = position * 0.15;
    const opacity = 1 - percent;
    const animate = deleteUndefined({ x, y, opacity });

    return (
      <m.div
        key={item.id}
        animate={animate}
        transition={{ duration: slideDuration }}
        style={{ originX: 'center', originY: 'center' }}
        exit={{ opacity: 0 }}
      >
        <EventPipeItem
          item={item}
          size={thickness}
          parentSize={baseSize}
          orientation={orientation}
          onClick={props.onEventClick}
        />
      </m.div>
    );
  });

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      <LazyMotion features={domAnimation}>
        <AnimatePresence>{isReady ? elEvents : []}</AnimatePresence>
      </LazyMotion>
    </div>
  );
};
