/**
 * https://handsontable.com/docs/6.2.2/frameworks-wrapper-for-react-custom-renderer-example.html
 * https://handsontable.com/docs/6.2.2/demo-custom-renderers.html
 */
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { Grid } from '../../api';
import { RegisterRenderer, Renderer } from '../../types';
import { FactoryManager } from '../factory';
import * as css from '../../styles/global.cell';
import { t, constants } from '../../common';

const CLASS = css.CLASS;
const { CELL, GRID } = CLASS;

/**
 * Renders a cell.
 *
 * See also:
 *   - /styles/global.cell.ts
 */
export const cellRenderer = (grid: Grid, factory: FactoryManager) => {
  const CACHE: any = {};

  function toHtml(args: { td: HTMLElement; row: number; column: number; cell?: t.IGridCell }) {
    const el = toElement(args);
    return ReactDOMServer.renderToString(el);
  }

  function toElement(args: { td: HTMLElement; row: number; column: number; cell?: t.IGridCell }) {
    const { row, column, cell } = args;
    const value = cell ? cell.value : undefined;
    const child: any = factory.cell({ row, column, value });
    const isHtml = typeof child === 'string' && child.startsWith('<');

    let className = CELL.BASE;
    className = isHtml ? `${CELL.MARKDOWN} ${className}` : className;
    className = row === 0 ? `${className} ${GRID.FIRST.ROW}` : className;
    className = column === 0 ? `${className} ${GRID.FIRST.COLUMN}` : className;

    if (isHtml) {
      return <div className={className} dangerouslySetInnerHTML={{ __html: child }} />;
    } else {
      return <div className={className}>{child}</div>;
    }
  }

  function toMemoizedHtml(args: {
    td: HTMLElement;
    row: number;
    column: number;
    cell?: t.IGridCell;
  }) {
    const { row, column } = args;
    const value = args.cell ? args.cell.value : undefined;
    const key = `${row}:${column}/${value || ''}`;
    if (CACHE[key]) {
      return CACHE[key];
    }
    const html = toHtml(args);
    CACHE[key] = html;
    return html;
  }

  const fn: Renderer = (instance, td, row, column, prop, value, cellProps) => {
    if (!grid.isDisposed) {
      td.innerHTML = toMemoizedHtml({ td, row, column, cell: value });
    }
    return td;
  };
  return fn;
};

/**
 * Register the cell renderer.
 */
export function registerCellRenderer(Table: Handsontable, grid: Grid, factory: FactoryManager) {
  const renderers = (Table as any).renderers;
  const fn: RegisterRenderer = renderers.registerRenderer;
  fn(constants.DEFAULT.CELL_RENDERER, cellRenderer(grid, factory));
}
