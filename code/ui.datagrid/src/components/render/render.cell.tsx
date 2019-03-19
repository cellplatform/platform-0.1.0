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

const STYLES = {
  cell: {
    base: css({
      position: 'relative',
      pointerEvents: 'none',
      fontSize: 14,
      color: color.format(-0.7),
    }),
  },
};

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
    return <div {...STYLES.cell.base}>{factory.cell({ row, column, value })}</div>;
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

// // import * as React from 'react';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// // import { css, color, GlamorValue } from '../../common';

// export type IFooProps = { style?: GlamorValue };
// export type IFooState = {
//   text?: string;
// };

// export class Foo extends React.PureComponent<IFooProps, IFooState> {
//   public state: IFooState = {};
//   private unmounted$ = new Subject();
//   private state$ = new Subject<Partial<IFooState>>();

//   /**
//    * [Lifecycle]
//    */
//   public componentWillMount() {
//     this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
//     console.log('mounted', this);
//     this.state$.next({ text: 'Hello2' });
//   }

//   public componentWillUnmount() {
//     this.unmounted$.next();
//   }

//   /**
//    * [Render]
//    */
//   public render() {
//     const styles = {
//       base: css({}),
//     };
//     return (
//       <div {...css(styles.base, this.props.style)}>
//         <div>Foo: {this.state.text}</div>
//       </div>
//     );
//   }
// }
