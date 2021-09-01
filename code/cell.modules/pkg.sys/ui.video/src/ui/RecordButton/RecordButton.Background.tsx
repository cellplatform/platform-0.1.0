import { m, domAnimation, LazyMotion } from 'framer-motion';
import React from 'react';

import { color, COLORS, css, CssValue, transition } from './common';
import { RecordButtonState } from './types';

export type BackgroundProps = {
  isEnabled: boolean;
  borderRadius: { root: number; inner: number };
  state: RecordButtonState;
  width: number;
  height: number;
  blur?: number;
  style?: CssValue;
};

export const Background: React.FC<BackgroundProps> = (props) => {
  const { isEnabled, borderRadius, width, height, state } = props;
  const blur = props.blur ?? 12;

  let borderColor = color.format(-0.2);

  const inner = {
    bg: isEnabled ? COLORS.RED : color.format(-0.2),
  };

  if (isEnabled) {
    if (['recording', 'paused'].includes(state)) borderColor = COLORS.RED;
    if (['recording', 'paused'].includes(state)) inner.bg = color.alpha(COLORS.RED, 0.1);
    if (['dialog'].includes(state)) inner.bg = color.format(0);
  }

  const styles = {
    base: css({
      display: 'flex',
      borderWidth: 3,
      padding: 3,
      boxSizing: 'border-box',
      borderStyle: 'solid',
      borderRadius: borderRadius.root,
    }),
    inner: css({
      flex: 1,
      position: 'relative',
      Flex: 'center-center',
      overflow: 'hidden',
      backdropFilter: `blur(${blur}px)`,
      borderRadius: borderRadius.inner,
    }),
  };

  return (
    <m.div
      {...css(styles.base, props.style)}
      style={{ borderColor, width, height }}
      animate={{ width, height, borderColor }}
      transition={transition}
    >
      <m.div
        {...styles.inner}
        style={{
          borderColor,
          backgroundColor: inner.bg,
        }}
        animate={{
          borderColor,
          backgroundColor: inner.bg,
        }}
      />
    </m.div>
  );
};
