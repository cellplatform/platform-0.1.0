import { AnimatePresence, domMax, LazyMotion, m } from 'framer-motion';
import React from 'react';

import { css, CssValue, defaultValue } from '../../common';
import { CardStackItem, CardStackItemRenderArgs } from './types';

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
  if (items.length > maxDepth) items = items.slice(items.length - maxDepth);
  const top = items[items.length - 1];

  const styles = {
    base: css({ position: 'relative', boxSizing: 'border-box' }),
    item: {
      base: { position: 'absolute' },
      top: { position: 'relative' },
    },
  };

  const elItems = items.map((item) => {
    const card = render(items, item);
    if (card.is.top) return undefined;

    const y = card.is.top ? 0 : 0 - card.position * 5;
    const percent = card.position * 0.05;
    const scale = 1 - percent;

    return (
      <m.div key={item.id} animate={{ y, scale }} transition={{ duration }} exit={{ opacity: 0 }}>
        <div {...css(styles.item.base)}>{card.toElement()}</div>
      </m.div>
    );
  });

  return (
    <div {...css(styles.base, props.style)}>
      <LazyMotion features={domMax}>
        <AnimatePresence>{elItems}</AnimatePresence>
      </LazyMotion>
      {top && <div {...styles.item.top}>{render(items, top).toElement()}</div>}
    </div>
  );
};

/**
 * [Helpers]
 */

function render(items: CardStackItem[], item: CardStackItem) {
  const index = items.indexOf(item);
  const total = items.length;
  const position = total - index - 1;
  const is = { bottom: index === 0, top: index === total - 1 };
  const args: CardStackItemRenderArgs = { total, position, index, is };
  const toElement = () => (typeof item.el === 'function' ? item.el(args) : item.el);
  return { ...args, toElement };
}
