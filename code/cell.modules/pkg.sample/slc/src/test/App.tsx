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
      Absolute: [-8, 0, null, null],
      width: 120,
    }),
    ul: css({ fontSize: 14, fontFamily: 'monospace' }),
    key: css({ display: 'inline-block', width: 60 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <h1>Hello World!</h1>
      <img src={bundle.path('/static/images/wax.png')} {...styles.image} />
      <ul {...styles.ul}>
        {Object.keys(bundle)
          .map((key) => ({ key, value: bundle[key] }))
          .filter(({ value }) => typeof value !== 'function')
          .map(({ key, value }, i) => {
            return (
              <div key={i}>
                <div {...styles.key}>{key}</div> {value?.toString() || '<undefined>'}
              </div>
            );
          })}
      </ul>
    </div>
  );
};

export default App;
