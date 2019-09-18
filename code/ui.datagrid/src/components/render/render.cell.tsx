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
import { t, constants, hash, formula } from '../../common';

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

  function toHtml(args: { td: HTMLElement; row: number; column: number; cell?: t.IGridCell }) {
    const el = toElement(args);
    return ReactDOMServer.renderToString(el);
  }

  function toElement(args: { td: HTMLElement; row: number; column: number; cell?: t.IGridCell }) {
    const { row, column, cell } = args;
    const child: any = factory.cell({ row, column, cell });
    const isHtml = typeof child === 'string' && child.startsWith('<');
    const isFormula = formula.isFormula(cell);

    const props: t.ICellProps = cell ? cell.props || {} : {};
    const style: t.ICellPropsStyle = props.style || {};

    let className = CELL.BASE;
    const add = (isRequired: boolean | undefined, value: string) =>
      (className = isRequired ? `${className} ${value}` : className);

    add(isHtml, CELL.MARKDOWN);
    add(row === 0, GRID.FIRST.ROW);
    add(column === 0, GRID.FIRST.COLUMN);
    add(style.bold, CELL.BOLD);
    add(style.italic, CELL.ITALIC);
    add(style.underline, CELL.UNDERLINE);
    add(formula.isFormula(cell), CELL.FORMULA);

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
    const key = `${row}:${column}/${hash.sha256(args.cell)}`;
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
