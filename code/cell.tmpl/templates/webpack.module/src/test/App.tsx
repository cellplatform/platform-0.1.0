import * as React from 'react';
import { css, CssValue } from '../common';

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
      <img src={'/static/images/wax.png'} {...styles.image} />
    </div>
  );
};
