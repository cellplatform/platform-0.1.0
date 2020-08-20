import * as React from 'react';
import { render, css } from '@platform/ui.dev';

const test = {
  Component: import('./components/Test.Component'),
  Columns: import('./components/Test.Columns'),
  State: import('./components/Test.State'),
};

type M = { Test: React.FunctionComponent };
const key = window.location.search.trim().replace(/^\?/, '');
const component = test[key];

if (component) {
  /**
   * Load selected component.
   */
  component.then((e: M) => render(React.createElement(e.Test)));
  document.title = `${document.title} - ${key}`;
} else {
  /**
   * Index of test components.
   */
  const styles = {
    ul: css({
      fontFamily: 'sans-serif',
      margin: 30,
      marginTop: 40,
      lineHeight: '1.8em',
    }),
    a: css({ textDecoration: 'none' }),
  };

  const items = Object.keys(test).map((key) => {
    return (
      <li key={key}>
        <a href={`./?${key}`} {...styles.a}>
          {key}
        </a>
      </li>
    );
  });

  const ul = <ul {...styles.ul}>{items}</ul>;
  render(ul);
}
