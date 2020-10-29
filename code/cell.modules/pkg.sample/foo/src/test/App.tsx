import React from 'react';
import { css, CssValue, bundle, log } from '../common';

log.info('bundle', bundle);

export type AppProps = { style?: CssValue };

export const App: React.FC<AppProps> = (props: AppProps = {}) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      PaddingX: 30,
    }),
    image: css({
      Absolute: [-5, 0, null, null],
      width: 120,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <h1>Hello World!</h1>
      <img src={bundle.path('/static/images/wax.png')} {...styles.image} />
    </div>
  );
};

export default App;
