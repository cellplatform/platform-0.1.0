import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { css, CssValue, style } from '@platform/css';

/**
 * NOTE: A mixure of styles applied both globally in the <head>
 *       and scoped onto the elements themselves.
 */
style.global({
  body: {
    backgroundColor: '#ececec',
    fontFamily: 'sans-serif',
    padding: 25,
  },
});

style.global(
  {
    h1: {
      letterSpacing: '-2.5px',
      fontSize: 74,
    },
  },
  { prefix: '.foo' }, // NB: class-name prefix scoping on style.
);

const MyApp = (props: { style?: CssValue }) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      padding: 30,
    }),
    h1: css({
      textDecoration: 'underline',
      ':hover': {
        color: 'blue',
        cursor: 'pointer',
      },
    }),
  };

  return (
    <div {...css(styles.base, props.style)} className={'foo'}>
      <h1 {...styles.h1}>Hello, CSS</h1>
    </div>
  );
};

ReactDOM.render(<MyApp style={{ color: 'red' }} />, document.getElementById('root'));
