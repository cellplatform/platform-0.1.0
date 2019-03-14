import '../node_modules/@platform/css/reset.css';
import '../static/css/handsontable.full.min.css';

import * as React from 'react';
import { Test } from '../src/components/Grid/Test';
import { color, css, renderer } from '../src/common/renderer';

const styles = {
  base: css({
    Absolute: 0,
    backgroundColor: color.format(-0.08),
  }),
  grid: css({
    Absolute: [20, 20, 20, 200],
    border: `solid 1px ${color.format(-0.2)}`,
  }),
};
const el = (
  <div {...styles.base}>
    <Test style={styles.grid} />
  </div>
);

renderer.render(el, 'root');
