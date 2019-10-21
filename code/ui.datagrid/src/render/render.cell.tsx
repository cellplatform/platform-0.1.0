/**
 * https://handsontable.com/docs/6.2.2/frameworks-wrapper-for-react-custom-renderer-example.html
 * https://handsontable.com/docs/6.2.2/demo-custom-renderers.html
 */
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { Grid } from '../api';
import { constants, coord, func, t, util } from '../common';
import { FactoryManager } from '../factory';
import * as css from '../styles/global.cell';

const CLASS = css.CLASS;
const { CELL, GRID } = CLASS;

/**
 * Renders a cell.
 *
 * See also:
 *   - /styles/global.cell.ts
 */
export const cellRenderer = (grid: t.IGrid, factory: FactoryManager) => {
  const CACHE: any = {};

  function toHtml(args: { td: HTMLElement; row: number; column: number; cell?: t.IGridCellData }) {
    const el = toElement(args);
    return ReactDOMServer.renderToString(el);
  }

  function toElement(args: {
    td: HTMLElement;
    row: number;
    column: number;
    cell?: t.IGridCellData;
  }) {
    const { row, column, cell } = args;
    const child: any = factory.cell({ row, column, cell });
    const isHtml = typeof child === 'string' && child.startsWith('<');

    const props: t.IGridCellProps = cell ? cell.props || {} : {};
    const style: t.IGridCellPropsStyle = props.style || {};
    const view: t.IGridCellPropsView = props.view || constants.DEFAULT.CELL.PROPS.view;

    let className = CELL.BASE;
    const add = (isRequired: boolean | undefined, value?: string) =>
      (className = isRequired && value ? `${className} ${value}` : className);

    add(isHtml, CELL.MARKDOWN);
    add(row === 0, GRID.FIRST.ROW);
    add(column === 0, GRID.FIRST.COLUMN);
    add(style.bold, CELL.BOLD);
    add(style.italic, CELL.ITALIC);
    add(style.underline, CELL.UNDERLINE);
    add(func.isFormula(cell && cell.value), CELL.FORMULA);
    add(Boolean(view.className), view.className);
    add(Boolean(props.status && props.status.error), CELL.ERROR);

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
    cell?: t.IGridCellData;
  }) {
    const { row, column, cell } = args;
    const hash = cell ? cell.hash || util.cellHash(coord.cell.toKey(column, row), cell) : '-';
    const key = `${row}:${column}/${hash}`;
    if (CACHE[key]) {
      return CACHE[key];
    }
    const html = toHtml(args);
    CACHE[key] = html;
    return html;
  }

  const fn: t.Renderer = (instance, td, row, column, prop, value, cellProps) => {
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
  const fn: t.RegisterRenderer = renderers.registerRenderer;
  fn(constants.DEFAULT.CELL.RENDERER, cellRenderer(grid, factory));
}
