import '../node_modules/@platform/css/reset.css';
import '../static/css/handsontable.full.min.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Test } from '../src/components/Grid/Test';
import { css } from '../src/common';

try {
  const styles = {
    base: css({
      Absolute: 0,
      display: 'flex',
    }),
  };
  const root = (
    <div {...styles.base}>
      <Test style={{ Absolute: 0 }} />
    </div>
  );

  // const el = <Test />;
  ReactDOM.render(root, document.getElementById('root'));
} catch (error) {
  /**
   * 🐷 TODO  Do something with the error, like:
   *          - Log it somewhere.
   *          - Alert the main process, etc.
   */
}
