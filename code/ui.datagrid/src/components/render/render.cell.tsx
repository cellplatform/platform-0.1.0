/**
 * https://handsontable.com/docs/6.2.2/frameworks-wrapper-for-react-custom-renderer-example.html
 * https://handsontable.com/docs/6.2.2/demo-custom-renderers.html
 */
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';

import { Grid } from '../../api';
import { color, css, t } from '../../common';
import { RegisterRenderer, Renderer } from '../../types';
import { FactoryManager } from '../factory';
import * as constants from './constants';

import { CLASS_NAME as EDITOR_CLASS_NAME } from '@platform/ui.editor';

// Override Handontable CSS that messes with the cell markdown-styles.
const globalMarkdown = {
  '*': {
    // Reset CSS from handsontable.
    paddingInlineStart: 0,
    marginBlockStart: 0,
    marginBlockEnd: 0,
  },
  'h1, h2': {
    borderBottom: 'none',
    paddingBottom: 0,
    marginBottom: '1em',
  },
  h1: { fontSize: '1.4em' },
  h2: { fontSize: '1.2em' },
  h3: { fontSize: '1em' },
  h4: { fontSize: '1em' },
  hr: {
    marginTop: '0.1em',
    marginBottom: '0.1em',
    borderBottomWidth: `3px`,
  },
};
css.global(globalMarkdown, { prefix: `.${EDITOR_CLASS_NAME.CONTENT_MARKDOWN}` });

/**
 * Base cell styles.
 */
const CELL = constants.CSS_CLASS.CELL;
css.global({
  [`.${CELL}.p-content`]: {
    // Reset CSS from handsontable.
    // all: 'unset',
    whiteSpace: 'normal',

    // Base cell styles.
    boxSizing: 'border-box',
    pointerEvents: 'none',
    fontSize: 14,
    color: color.format(-0.7),
    marginTop: 2,
  },
  [`.${CELL}.p-content.p-first-row`]: {
    marginTop: 1,
  },
});

/**
 * Renders a cell.
 */
export const cellRenderer = (grid: Grid, factory: FactoryManager) => {
  const CACHE: any = {};

  function toHtml(args: { td: HTMLElement; row: number; column: number; value?: t.CellValue }) {
    const el = toElement(args);
    return ReactDOMServer.renderToString(el);
  }

  function toElement(args: { td: HTMLElement; row: number; column: number; value?: t.CellValue }) {
    const { row, column, value } = args;
    const child: any = factory.cell({ row, column, value });
    const isHtml = typeof child === 'string' && child.startsWith('<');

    let className = constants.CSS_CLASS.CELL;
    className = isHtml ? `${EDITOR_CLASS_NAME.CONTENT_MARKDOWN} ${className}` : className;
    className = row === 0 ? `${className} p-first-row` : className;
    className = column === 0 ? `${className} p-first-column` : className;
    className = `${className} p-content`;

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
    value?: t.CellValue;
  }) {
    const { row, column: col, value } = args;
    const key = `${row}:${col}/${value}`;
    if (CACHE[key]) {
      return CACHE[key];
    }
    const html = toHtml(args);
    CACHE[key] = html;
    return html;
  }

  const fn: Renderer = (instance, td, row, column, prop, value, cellProps) => {
    if (!grid.isDisposed) {
      td.innerHTML = toMemoizedHtml({ td, row, column, value });
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
  fn(constants.CELL_DEFAULT, cellRenderer(grid, factory));
}
