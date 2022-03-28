import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import React from 'react';

import {
  color,
  css,
  CssValue,
  defaultValue,
  deleteUndefined,
  useResizeObserver,
  COLORS,
} from '../../common';
import { EventHistoryItem } from '../Event/types';
import {
  EventPipeItem,
  EventPipeItemClickEvent,
  EventPipeItemClickEventHandler,
} from './EventPipe.Item';

export { EventPipeItemClickEventHandler, EventPipeItemClickEvent };

/**
 * Types
 */
export type EventPipeTheme = 'Dark' | 'Light';

export type EventPipeProps = {
  events?: EventHistoryItem[];
  backgroundColor?: string | number;
  event?: { max?: number };
  orientation?: 'x' | 'y';
  thickness?: number;
  duration?: { slide?: number }; // msecs
  theme?: EventPipeTheme;
  style?: CssValue;
  onEventClick?: EventPipeItemClickEventHandler;
};

/**
 * Constants
 */
const THEMES: EventPipeTheme[] = ['Light', 'Dark'];
const DEFAULT_THEME: EventPipeTheme = 'Light';
const DEFAULT = { THEME: DEFAULT_THEME };
export const EventPipeConstants = {
  DEFAULT,
  THEMES,
};

/**
 * Component
 */
export const EventPipe: React.FC<EventPipeProps> = (props) => {
  const { orientation = 'x', thickness = 8, theme = 'Light' } = props;
  const slideDuration = defaultValue(props.duration?.slide, 300) / 1000;
  const max = defaultValue(props.event?.max, 10);

  let events = props.events || [];
  if (events.length > max) {
    events = events.slice(events.length - max);
  }

  const size = useResizeObserver();
  const isReady = size.ready;
  const baseSize = orientation === 'x' ? size.rect.width : size.rect.height;

  /**
   * Theme/Colors
   */
  const isLight = theme === 'Light';
  const backgroundColor = (() => {
    if (props.backgroundColor !== undefined) return props.backgroundColor;
    return isLight ? -0.06 : 0.15;
  })();

  const itemColor = isLight ? COLORS.DARK : 1;

  /**
   * [Render]
   */
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
          color={itemColor}
          onClick={props.onEventClick}
        />
      </m.div>
    );
  });

  return (
    <div ref={size.ref} {...css(styles.base, props.style)}>
      <LazyMotion features={domAnimation}>
        <AnimatePresence>{isReady ? elEvents : []}</AnimatePresence>
      </LazyMotion>
    </div>
  );
};
