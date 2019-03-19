import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { GlamorValue, Handsontable as HandsontableLib, t, datagrid } from './common';
import { Editor } from '../../src/components/Editor';
// import * as render from '../../src/components/render';
import { TestEditor } from './Test.Editor';

// const createColumns = (length: number) => {
//   return Array.from({ length }).map(() => {
//     return {
//       renderer: render.CELL_DEFAULT,
//       editor: Editor,
//     };
//   });
// };

export type ITestProps = {
  style?: GlamorValue;
  Table?: Handsontable;
};
export type ITestState = {
  // settings?: datagrid.IGridSettings;
  // data?: object;
  values?: t.IGridValues;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();
  private events$ = new Subject<t.GridEvent>();

  public datagrid!: datagrid.DataGrid;
  private datagridRef = (ref: datagrid.DataGrid) => (this.datagrid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const Table = this.Table;
    // const settings = createSampleData({ Table });
    // settings.beforeKeyDown = beforeKeydownHandler(() => this.grid);

    // this.state$.next({ settings });
    // render.registerAll(Table);

    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    events$
      .pipe(
        filter(e => e.type === 'GRID/EDITOR/end'),
        map(e => e as t.IEndEditingEvent),
        filter(e => !e.payload.isCancelled),
      )
      .subscribe(e => {
        // e.payload.cancel();
        // e.payload.cell.value = 'boo';
        // let settings = this.state.settings;
        // if (settings) {
        //   // settings = { ...settings };
        //   // const { cell } = e.payload;
        //   // const data = { ...settings.data };
        //   // // data[row][column] = e.payload.value.to; // HACK - test only:  do this immutably.
        //   // data[cell.row][cell.column] = 'yo mama';
        //   // settings.data = data;
        //   // this.state$.next({ settings });
        // }
      });

    events$
      .pipe(
        filter(e => e.type === 'GRID/EDITOR/begin'),
        map(e => e as t.IBeginEditingEvent),
      )
      .subscribe(e => {
        // Cancel upon start of edit operation.
        // e.payload.cancel();
      });

    events$.pipe(filter(e => !['GRID/keydown'].includes(e.type))).subscribe(e => {
      console.log('🌳  EVENT', e.type, e.payload);
    });

    const change$ = events$.pipe(
      filter(e => e.type === 'GRID/change'),
      map(e => e.payload as t.IGridChange),
    );

    const changeSet$ = events$.pipe(
      filter(e => e.type === 'GRID/changeSet'),
      map(e => e.payload as t.IGridChangeSet),
    );

    change$.subscribe(e => {
      // e.cancel();
      // console.log('CHANGE', e);
    });

    change$.pipe(filter(e => e.cell.key === 'B2')).subscribe(e => {
      console.log('B2');
      e.cancel();
    });

    // changeSet$.subscribe(e => {});
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  private get Table() {
    const { Table = HandsontableLib } = this.props;
    return Table as Handsontable;
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <datagrid.DataGrid
        ref={this.datagridRef}
        // settings={this.state.settings}
        events$={this.events$}
        factory={this.factory}
        Handsontable={this.Table}
        style={this.props.style}
      />
    );
  }

  private factory: t.GridFactory = req => {
    switch (req.type) {
      case 'EDITOR':
        if (req.column === 1 && req.row === 0) {
          return null;
        }

        return <TestEditor />;

      default:
        console.log(`Factory type '${req.type}' not supported by test.`);
        return null;
    }
  };
}

/**
 * `Sample Data`
 */
export function createEmptyData(rows: number, columns: number) {
  return Array.from({ length: rows }).map((v, row) =>
    Array.from({ length: columns }).map((v, column) => {
      // return { foo: 123 } as any;
      return '';
      // return datagrid.Cell.toKey({ row, column });
    }),
  );
}

export function createSampleData(args: { Table: Handsontable }) {
  // const { Table } = args;
  // const data = Table.helper.createSpreadsheetData(1000, 100);
  const data = createEmptyData(1000, 100);
  data[0][0] = 'A1';
  data[0][1] = 'locked';
  data[1][1] = 'cancel';

  // console.log('data', data);

  // console.log('data', data);
  // const getSelectedLast = this.getSelectedLast

  const settings = {
    data: [],
    // columns: createColumns(100),

    // observeChanges: true,

    // /**
    //  * See:
    //  *   - https://handsontable.com/docs/6.2.2/Hooks.html#event:afterBeginEditing
    //  *   - Source callback
    //  *      https://handsontable.com/docs/6.2.2/tutorial-using-callbacks.html#page-source-definition
    //  */
    // beforeChange(changes, source) {
    //   console.group('🌳 beforeChange');
    //   console.log('source', source);
    //   console.log('changes', [...changes]);
    //   console.groupEnd();
    //   return false; // Cancel's change.
    // },

    // afterChange(e) {
    //   // console.log('afterChange', e);
    // },

    // afterScrollVertically() {
    //   // console.log('scroll');
    // },
  };

  return settings;
}
