/**
 * https://handsontable.com/docs/6.2.2/frameworks-wrapper-for-react-custom-renderer-example.html
 * https://handsontable.com/docs/6.2.2/demo-custom-renderers.html
 */
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { Grid } from '../../api';
import { color, css } from '../../common';
import { RegisterRenderer, Renderer } from '../../types';
import * as constants from './constants';

const styles = {
  // header: css({ backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */ }),
  cell: {
    base: css({
      position: 'relative',
      pointerEvents: 'none',
    }),
    value: css({
      // color: COLORS.BLUE,
      color: color.format(-0.65),
      fontSize: 14,
    }),
  },
};

/**
 * Renders a cell.
 */
export const cellRenderer = (grid: Grid) => {
  const fn: Renderer = (instance, td, row, col, prop, value, cellProps) => {
    if (grid.isDisposed) {
      return td;
    }
    // console.group('🌳 render');
    // console.log('instance', instance);
    // console.log('TD', td);
    // console.log('row', row);
    // console.log('col', col);
    // console.log('prop', prop);
    // console.log('value', value);
    // console.log('cellProps', cellProps);
    // console.groupEnd();
    // console.log('row', row);

    // console.log('grid.instanceId', grid.instanceId);
    console.log('grid.id', grid.id, grid.isDisposed);

    if (row === 0 && col === 0) {
      // console.log(key, value);
    }

    td.innerHTML = toCellHtmlMemoized({ col, row, value });
    return td;
  };
  return fn;
};

function toCellHtml(args: { row: number; col: number; value?: string }) {
  let value = args.value;
  value = typeof value === 'object' ? JSON.stringify(value) : value;
  const el = (
    <div {...styles.cell.base}>
      <span {...styles.cell.value}>{value}</span>
    </div>
  );
  return ReactDOMServer.renderToString(el);
}

const CACHE: any = {};
function toCellHtmlMemoized(args: { row: number; col: number; value?: string }) {
  const { row, col, value } = args;
  const key = `${row}:${col}:${value}`;
  if (CACHE[key]) {
    return CACHE[key];
  }
  const html = toCellHtml(args);
  CACHE[key] = html;
  return html;
}

/**
 * Register the cell renderer.
 */
export function registerCellRenderer(Table: Handsontable, grid: Grid) {
  const renderers = (Table as any).renderers;
  const fn: RegisterRenderer = renderers.registerRenderer;
  fn(constants.CELL_DEFAULT, cellRenderer(grid));
}
