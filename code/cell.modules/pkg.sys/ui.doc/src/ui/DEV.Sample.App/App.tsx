import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t } from './common';
import { DocIndex } from '../Doc.Index';

export type AppProps = { style?: CssValue };

export const App: React.FC<AppProps> = (props) => {
  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: COLORS.BG,
    }),
  };
  return <DocIndex style={styles.base} />;
};
