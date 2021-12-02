import React from 'react';

import { color, COLORS, css, CssValue } from '../common';

export type DevOuterProps = { style?: CssValue };

export const DevOuter: React.FC<DevOuterProps> = (props) => {
  const styles = {
    base: css({
      display: 'flex',
      position: 'relative',
      padding: 3,
      borderRadius: 5,
      border: `dashed 1px ${color.alpha(COLORS.MAGENTA, 0.3)}`,
      backgroundColor: color.format(0.4),
      pointerEvents: 'auto',
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.children}</div>;
};
