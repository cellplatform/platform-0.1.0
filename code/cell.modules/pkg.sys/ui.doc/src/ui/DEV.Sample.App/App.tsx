import React from 'react';

import { SAMPLE } from '../DEV.Sample.data';
import { RouteContainer } from '../RouteContainer';
import { COLORS, css, CssValue } from './common';

export type AppProps = { style?: CssValue };

export const App: React.FC<AppProps> = (props) => {
  const styles = {
    base: css({ Absolute: 0 }),
  };
  return <RouteContainer style={styles.base} defs={SAMPLE.defs} />;
};
