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

const STYLES = {
  cell: {
    base: css({
      position: 'relative',
      pointerEvents: 'none',
      fontSize: 14,
      color: color.format(-0.7),
    }),
    markdownHtml: css({
      paddingTop: 2,
    }),
  },
};

// Override Handontable CSS that messes with the cell markdown-styles.
const global = {
  '*': {
    boxSizing: 'border-box',
    whiteSpace: 'normal',
    paddingInlineStart: 0,
    marginBlockStart: 0,
    marginBlockEnd: 0,
  },
  'h1, h2': {
    borderBottom: 'none',
    paddingBottom: 0,
  },
  h1: { fontSize: '1.4em' },
  h2: { fontSize: '1.2em' },
  h3: { fontSize: '1em' },
  h4: { fontSize: '1em' },
};
css.global(global, { prefix: `.${EDITOR_CLASS_NAME.CONTENT_MARKDOWN}` });

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
    let child: any = factory.cell({ row, column, value });

    // If the content is HTML (parsed markdown) ensure it is rendered as HTML.
    if (typeof child === 'string' && child.startsWith('<')) {
      child = (
        <div
          className={EDITOR_CLASS_NAME.CONTENT_MARKDOWN}
          {...STYLES.cell.markdownHtml}
          dangerouslySetInnerHTML={{ __html: child }}
        />
      );
    }

    return <div {...STYLES.cell.base}>{child}</div>;
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
