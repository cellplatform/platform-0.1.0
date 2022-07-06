import React from 'react';

import { SAMPLE } from '../DEV.Sample.DATA';
import { RouteContainer } from '../RouteContainer.OLD';
import { css, CssValue } from './common';
import { Doc } from '../Doc';

export type AppProps = { style?: CssValue };

export const App: React.FC<AppProps> = (props) => {
  const styles = {
    base: css({ Absolute: 0 }),
    inner: css({ Absolute: 0 }),
  };
  return (
    <Doc.Fonts style={styles.base}>
      <RouteContainer style={styles.inner} defs={SAMPLE.defs} />
    </Doc.Fonts>
  );
};

export default App;
