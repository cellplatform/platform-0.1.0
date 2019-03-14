import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { Grid, IGridSettings } from '.';
import { GlamorValue, Handsontable, css, t } from '../../common';
import { Editor } from '../Editor';
import * as render from '../Grid.render';

export { Handsontable };

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
  settings?: IGridSettings;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject();
  private events$ = new Subject<t.GridEvent>();

  private grid!: Grid;
  private gridRef = (ref: Grid) => (this.grid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const Table = this.Table;

    const settings = createSampleData({ Table });
    settings.beforeKeyDown = beforeKeydownHandler(() => this.grid);

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
      console.log('🌳  EVENT', e.type);
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  private get Table() {
    const { Table = Handsontable } = this.props;
    return Table;
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <Grid
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

  const settings: IGridSettings = {
    data,
    columns: createColumns(100),

    // observeChanges: true,

    // rowHeaders: true,
    // colHeaders: true,
    // colWidths: 100,
    // viewportRowRenderingOffset: 20,
    // manualRowResize: true,
    // manualColumnResize: true,

    // colHeaders: col => renderer.renderHeader({ col }),
    // viewportColumnRenderingOffset: 80,

    /**
     * See:
     *   - https://handsontable.com/docs/6.2.2/Hooks.html#event:afterBeginEditing
     *   - Source callback
     *      https://handsontable.com/docs/6.2.2/tutorial-using-callbacks.html#page-source-definition
     */
    beforeChange(changes, source) {
      console.group('🌳 beforeChange');
      console.log('source', source);
      console.log('changes', [...changes]);
      console.groupEnd();

      // return false;
    },

    afterChange(e) {
      console.log('afterChange', e);
    },

    afterScrollVertically() {
      console.log('scroll');
    },
  };

  return settings;
}

export type ITestEditorProps = {};
export type ITestEditorState = {};

export class TestEditor extends React.PureComponent<ITestEditorProps, ITestEditorState> {
  public state: ITestEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestEditorState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    console.log('--------------------editor mounted');
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };
    return (
      <div {...styles.base}>
        <input defaultValue={'foobar'} />
      </div>
    );
  }
}

/**
 * See:
 *   - https://jsfiddle.net/handsoncode/n8eft0m1/
 *   - https://forum.handsontable.com/t/keyboard-cycling/2802/4
 */
const beforeKeydownHandler = (getGrid: () => Grid) => {
  return function(event: Event) {
    const e = event as KeyboardEvent;
    const grid = getGrid();

    if (grid.isEditing && !['Enter', 'Escape'].includes(e.key)) {
      e.stopImmediatePropagation();
      return;
    }

    console.log('grid.isEditing', grid.isEditing);

    // e.preventDefault();
    // e.stopImmediatePropagation();
    console.log('beforeKeydown', e);

    // @ts-ignore
    const last = this.getSelectedLast();
    const row = last[0];
    const col = last[1];

    const key = (e as KeyboardEvent).key;

    // console.group('🌳 ');
    // console.log('e', e);
    // console.log('row', row);
    // console.log('col', col);
    // console.groupEnd();

    const stop = () => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    if (row === 0 && key === 'ArrowUp') {
      stop();
    }
    if (col === 0 && key === 'ArrowLeft') {
      stop();
    }
  };
};
