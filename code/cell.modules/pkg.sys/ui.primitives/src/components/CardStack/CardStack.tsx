import { AnimatePresence, domMax, LazyMotion, m } from 'framer-motion';
import React from 'react';

import { css, CssValue, defaultValue } from '../../common';

export type CardStackItem = { id: string; el?: JSX.Element | (() => JSX.Element) };

export type CardStackProps = {
  items?: CardStackItem[];
  duration?: number; // msecs
  maxDepth?: number;
  style?: CssValue;
};

export const CardStack: React.FC<CardStackProps> = (props) => {
  const duration = defaultValue(props.duration, 300) / 1000;
  const maxDepth = defaultValue(props.maxDepth, 10);

  let items = props.items || [];
  if (items.length > maxDepth) {
    items = items.slice(items.length - maxDepth);
  }

  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
    }),
    item: {
      base: { position: 'absolute' },
      top: { position: 'relative' },
    },
  };

  const elItems = items.map((item, i) => {
    const total = items.length;
    const position = total - i - 1;
    const is = {
      first: i === 0,
      last: i === total - 1,
    };

    const styles = {
      base: { position: 'absolute' },
      top: { position: 'relative' },
    };

    const y = is.last ? 0 : 0 - position * 5;
    const percent = position * 0.05;
    const scale = 1 - percent;

    const el = typeof item?.el === 'function' ? item.el() : item?.el;
    return (
      <m.div key={item.id} animate={{ y, scale }} transition={{ duration }} exit={{ opacity: 0 }}>
        <div {...css(styles.base, is.last && styles.top)}>{el}</div>
      </m.div>
    );
  });

  return (
    <div {...css(styles.base, props.style)}>
      <LazyMotion features={domMax}>
        <AnimatePresence>{elItems}</AnimatePresence>
      </LazyMotion>
    </div>
  );
};
