import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import {
  COLORS,
  Button,
  color,
  css,
  GlamorValue,
  Hr,
  log,
  ObjectView,
  t,
  testData,
} from '../common';
import { TestGridView } from './Test.Grid.view';

export type ITestGridProps = {
  editorType: t.TestEditorType;
  style?: GlamorValue;
};
export type ITestGridState = {
  data?: any;
  totalColumns?: number;
  totalRows?: number;
};

export class TestGrid extends React.PureComponent<ITestGridProps, ITestGridState> {
  public state: ITestGridState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<ITestGridState>>();
  private events$ = new Subject<t.GridEvent>();

  private testGrid!: TestGridView;
  private testGridRef = (ref: TestGridView) => (this.testGrid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    // Update state.
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    /**
     * Grid events.
     */
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    events$
      .pipe(
        filter(() => true),
        filter(e => e.type === 'GRID/cells/changed'), // Filter
        map(e => e.payload as t.IGridCellsChanged),
      )
      .subscribe(e => {
        console.log('IGridCellsChanged', e);

        // e.cancel();
        // e.changes[0].modify('foo');

        // console.log('🌳', e.type, e.payload);
        // const change = e.payload as t.IGridCellChange;
        // change.modify('hello');
      });

    // events$
    //   .pipe(
    //     filter(() => true),
    //     filter(e => e.type === 'GRID/EDITOR/end'), // Filter
    //     map(e => e.payload as t.IEndEditing),
    //   )
    //   .subscribe(e => {
    //     console.log('cancel edit');
    //     e.cancel();
    //   });

    const command$ = events$.pipe(
      filter(e => e.type === 'GRID/command'),
      map(e => e.payload as t.IGridCommand),
    );

    command$.subscribe(e => {
      log.info('🐷 COMMAND:', e.command, e);
    });

    events$
      .pipe(
        filter(e => e.type === 'GRID/clipboard'),
        map(e => e.payload as t.IGridClipboard),
      )
      .subscribe(e => {
        console.log('CLIPBOARD', e);
      });
  }

  public componentDidMount() {
    const gridEvents$ = this.grid.events$.pipe(takeUntil(this.unmounted$));
    gridEvents$.subscribe(() => this.updateState());
    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get grid() {
    return this.testGrid.datagrid.grid;
  }

  private get test$() {
    return this.testGrid.state$;
  }

  /**
   * [Methods]
   */
  public updateState() {
    const grid = this.grid;
    const { selection, values, rows, columns, isEditing } = grid;
    const { editorType } = this.props;
    const data = {
      grid: { isEditing, values, rows, columns, selection },
      debug: { editorType },
    };
    this.state$.next({ data });
    return data;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Flex: 'horizontal',
        flex: 1,
        backgroundColor: color.format(-0.08),
      }),
    };

    return (
      <div {...styles.base}>
        {this.renderLeft()}
        {this.renderMain()}
        {this.renderState()}
      </div>
    );
  }

  private renderLeft() {
    const styles = {
      base: css({
        position: 'relative',
        width: 200,
        padding: 10,
        Scroll: true,
        fontSize: 13,
        lineHeight: 1.6,
      }),
    };
    return (
      <div {...styles.base}>
        {this.button('redraw', () => this.grid.redraw())}
        {this.button('focus', () => this.grid.focus())}
        {this.button('total row/columns', () => {
          if (typeof this.state.totalColumns === 'number') {
            this.state$.next({ totalColumns: undefined, totalRows: undefined });
          } else {
            this.state$.next({ totalColumns: 5, totalRows: 5 });
          }
          // this.grid.focus();
        })}
        <Hr margin={5} />
        {this.button('values', () => (this.grid.values = { A1: { value: 'loaded value' } }))}
        {this.button('changeValues', () => this.grid.changeCells({ A1: { value: 'hello' } }))}
        {this.button('changeValues (props)', () =>
          this.grid.changeCells({ A1: { value: 'hello', props: { bold: true } } }),
        )}
        {this.button('change values (via prop/state)', () =>
          this.test$.next({ values: { A1: { value: 'happy' } } }),
        )}
        {this.button('values (large)', () => {
          const data = testData({ totalColumns: 52, totalRows: 1000 });
          this.grid.values = data.values;
        })}

        <Hr margin={5} />
        {this.button('columns (width) - A:200', () =>
          this.test$.next({ columns: { A: { width: 200 } } }),
        )}
        {this.button('columns (width) - A:300', () =>
          this.test$.next({ columns: { A: { width: 300 } } }),
        )}
        {this.button('rows (height) - 1:0', () => this.test$.next({ rows: { 1: { height: 0 } } }))}
        {this.button('rows (height) - 1:120', () =>
          this.test$.next({ rows: { 1: { height: 120 } } }),
        )}
        <Hr margin={5} />
        {this.button('select: A1', () => this.grid.select({ cell: 'A1' }))}
        {this.button('select: A1 and range', () =>
          this.grid.select({ cell: 'A1', ranges: ['B2:C4', 'C2:D7'] }),
        )}
        {this.button('select: bottom/right', () =>
          this.grid.select({
            cell: { row: this.grid.totalRows, column: this.grid.totalColumns },
          }),
        )}
        {this.button('select column: B:B', () => this.grid.select({ cell: 'B1', ranges: ['B:B'] }))}
        {this.button('select row: 3:3', () => this.grid.select({ cell: 'A3', ranges: ['3:3'] }))}
        {this.button('select row and column', () =>
          this.grid.select({ cell: 'B1', ranges: ['3:3', 'B:B'], scrollToCell: false }),
        )}
        <Hr margin={5} />
        {this.button('scrollTo: A1', () => this.grid.scrollTo({ cell: 'A1' }))}
        {this.button('scrollTo: B5', () => this.grid.scrollTo({ cell: 'B5' }))}
        {this.button('scrollTo: bottom/right', () =>
          this.grid.scrollTo({
            cell: { row: this.grid.totalRows, column: this.grid.totalColumns },
          }),
        )}
        {/* <Hr margin={5} />
            {this.button(
              'changeBorders - B2:D4 (red)',
              () => (this.grid.borders = [{ range: 'B2:D4', style: { width: 2, color: 'red' } }]),
            )}
            {this.button(
              'changeBorders - B2:D4 (orange)',
              () =>
                (this.grid.borders = [{ range: 'B2:D4', style: { width: 2, color: 'orange' } }]),
            )}
            {this.button(
              'changeBorders (different edges)',
              () =>
                (this.grid.borders = [
                  {
                    range: 'C8:E12',
                    style: {
                      top: { width: 2, color: 'red' },
                      right: { width: 2, color: 'blue' },
                      bottom: { width: 2, color: 'orange' },
                      left: { width: 2, color: 'green' },
                    },
                  },
                ]),
            )}
            {this.button('changeBorders (clear)', () => (this.grid.borders = []))} */}
      </div>
    );
  }

  private renderMain() {
    const styles = {
      base: css({ position: 'relative', flex: 1 }),
      inner: css({
        Absolute: 10,
        border: `solid 1px ${color.format(-0.2)}`,
      }),
      grid: css({ Absolute: 0 }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.inner}>
          <TestGridView
            ref={this.testGridRef}
            style={styles.grid}
            editorType={this.props.editorType}
            events$={this.events$}
            totalColumns={this.state.totalColumns}
            totalRows={this.state.totalRows}
          />
        </div>
      </div>
    );
  }

  private renderState() {
    const data = this.state.data;
    if (!data) {
      return null;
    }
    const styles = {
      base: css({
        backgroundColor: COLORS.DARK,
        width: 300,
        padding: 8,
        paddingLeft: 12,
        Scroll: true,
        borderBottom: `solid 1px ${color.format(0.1)}`,
      }),
    };
    // const expand = ['$', '$.grid', '$.grid.selection', '$.grid.selection.ranges'];
    return (
      <div {...styles.base}>
        <ObjectView
          name={'grid'}
          data={data.grid}
          expandPaths={['$', '$', '$.selection', '$.selection.ranges', '$.values']}
          theme={'DARK'}
        />
        <Hr color={1} />
        <ObjectView name={'debug'} data={data.debug} expandPaths={['$']} theme={'DARK'} />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} block={true} />;
  };
}
