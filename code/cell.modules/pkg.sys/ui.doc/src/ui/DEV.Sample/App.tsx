import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx } from './common';

export type AppProps = { style?: CssValue };

export const App: React.FC<AppProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      Flex: 'center-center',
    }),
  };
  return <div {...css(styles.base, props.style)}>App 🐷</div>;
};
