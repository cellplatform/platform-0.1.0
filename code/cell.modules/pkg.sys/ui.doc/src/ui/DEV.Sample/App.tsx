import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, Doc } from './common';

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
  return (
    <Doc.Fonts style={css(styles.base, props.style)}>
      <Doc.Headline category={'Placeholder'} title={'Application...'} />
    </Doc.Fonts>
  );
};
