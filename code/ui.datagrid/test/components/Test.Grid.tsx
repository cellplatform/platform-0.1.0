import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { GlamorValue, Handsontable as HandsontableLib, t, datagrid } from './common';
import { Editor } from '../../src/components/Editor';
import * as render from '../../src/components/Grid.render';
import { TestEditor } from './Test.Editor';

const createColumns = (length: number) => {
  return Array.from({ length }).map(() => {
    return {
      renderer: render.MY_CELL,
      editor: Editor,
    };
  });
};

export type ITestProps = {
  style?: GlamorValue;
  Table?: Handsontable;
};
export type ITestState = {
  settings?: datagrid.IGridSettings;
  // data?: object;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();
  private events$ = new Subject<t.GridEvent>();

  private grid!: datagrid.Grid;
  private gridRef = (ref: datagrid.Grid) => (this.grid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const Table = this.Table;

    const settings = createSampleData({ Table });
    // settings.beforeKeyDown = beforeKeydownHandler(() => this.grid);

    this.state$.next({ settings });
    render.registerAll(Table);

    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    events$
      .pipe(
        filter(e => e.type === 'GRID/EDITOR/end'),
        map(e => e as t.IEndEditingEvent),
        filter(e => !e.payload.isCancelled),
      )
      .subscribe(e => {
        let settings = this.state.settings;
        if (settings) {
          settings = { ...settings };
          const { row, column } = e.payload;
          const data = { ...settings.data };
          // data[row][column] = e.payload.value.to; // HACK - test only:  do this immutably.
          data[row][column] = 'yo mama';
          settings.data = data;
          // this.state$.next({ settings });
        }
      });

    events$.subscribe(e => {
      // console.log('🌳  EVENT', e.type);
    });
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
      <datagrid.Grid
        ref={this.gridRef}
        settings={this.state.settings}
        events$={this.events$}
        editorFactory={this.renderEditor}
        Handsontable={this.Table}
        style={this.props.style}
      />
    );
  }

  private renderEditor = () => {
    return <TestEditor />;
  };
}

/**
 * `Sample Data`
 */
export function createEmptyData(rows: number, columns: number) {
  return Array.from({ length: rows }).map(row => Array.from({ length: columns }).map(col => ''));
}

export function createSampleData(args: { Table: Handsontable }) {
  // const { Table } = args;
  // const data = Table.helper.createSpreadsheetData(1000, 100);
  const data = createEmptyData(1000, 100);
  data[0][0] = 'A1';

  // console.log('data', data);
  // const getSelectedLast = this.getSelectedLast

  const settings: datagrid.IGridSettings = {
    data,
    columns: createColumns(100),

    // observeChanges: true,

    /**
     * See:
     *   - https://handsontable.com/docs/6.2.2/Hooks.html#event:afterBeginEditing
     *   - Source callback
     *      https://handsontable.com/docs/6.2.2/tutorial-using-callbacks.html#page-source-definition
     */
    beforeChange(changes, source) {
      // console.group('🌳 beforeChange');
      // console.log('source', source);
      // console.log('changes', [...changes]);
      // console.groupEnd();
      // return false; // Cancel's change.
    },

    afterChange(e) {
      // console.log('afterChange', e);
    },

    afterScrollVertically() {
      // console.log('scroll');
    },
  };

  return settings;
}
