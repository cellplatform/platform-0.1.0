import React from 'react';
import { color, COLORS, css, CssValue } from '../common';

export type CountLabelProps = {
  count: number;
  style?: CssValue;
};

export const CountLabel: React.FC<CountLabelProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      fontSize: 11,
      color: color.alpha(COLORS.MAGENTA, 0.25),
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.count}</div>;
};
