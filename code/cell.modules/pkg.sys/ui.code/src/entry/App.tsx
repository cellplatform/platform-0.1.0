import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, t } from '../common';

export type AppProps = { style?: CssValue };

export const App: React.FC<AppProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'center-center',
    }),
  };
  return <div {...css(styles.base, props.style)}>sys.ui.code</div>;
};
