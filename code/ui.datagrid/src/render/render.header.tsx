/**
 * https://handsontable.com/docs/6.2.2/frameworks-wrapper-for-react-custom-renderer-example.html
 * https://handsontable.com/docs/6.2.2/demo-custom-renderers.html
 */
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { COLORS, css } from '../common';

const styles = {
  header: css({}),
  cell: {
    base: css({
      position: 'relative',
      pointerEvents: 'none',
    }),
    value: css({ color: COLORS.BLUE, fontSize: 14 }),
  },
};

/**
 * Renders a column header.
 */
export function renderHeader(args: { col?: number }) {
  const { col } = args;
  const el = <div {...styles.header}>col: {col}</div>;
  const html = ReactDOMServer.renderToString(el);
  return html;
}
