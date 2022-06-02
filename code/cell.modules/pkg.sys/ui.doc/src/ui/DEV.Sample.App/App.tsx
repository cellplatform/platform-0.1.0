import React from 'react';

import { SAMPLE } from '../DEV.Sample.data';
import { DocIndex } from '../Doc.Index';
import { COLORS, css, CssValue } from './common';

export type AppProps = { style?: CssValue };

export const App: React.FC<AppProps> = (props) => {
  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: COLORS.BG,
    }),
  };
  return <DocIndex style={styles.base} items={SAMPLE.defs} />;
};
