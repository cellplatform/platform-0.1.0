import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type ComponentProps = { theme?: 'dark' | 'light'; style?: CssValue };

export const Component: React.FC<ComponentProps> = (props) => {
  const { theme = 'dark' } = props;
  const isDark = theme === 'dark';
  const styles = {
    base: css({
      padding: 50,
      color: isDark ? color.format(1) : color.format(-0.6),
    }),
  };
  return <div {...css(styles.base, props.style)}>Sample-3</div>;
};
