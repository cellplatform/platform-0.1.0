import * as React from 'react';

import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import {
  constants,
  log,
  Button,
  color,
  css,
  GlamorValue,
  Hr,
  ObjectView,
  t,
  coord,
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
        // filter(e => e.type === 'GRID/cell/change'), // Filter
      )
      .subscribe(e => {
        // console.log('🌳', e.type, e.payload);
        // const change = e.payload as t.IGridCellChange;
        // change.modify('hello');
      });

    const clipboard$ = events$.pipe(
      filter(e => e.type === 'GRID/clipboard'),
      map(e => e.payload as t.IGridClipboard),
    );

    clipboard$.subscribe(e => {
      log.group('🐷 CLIPBOARD');
      log.info('e', e);
      log.info('selection', e.selection);
      log.info('keys', e.keys);
      log.info('selectedValues', e.grid.selectedValues);
      log.groupEnd();
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
    const { selection, values, rows, columns } = grid;
    const { editorType } = this.props;
    const data = {
      grid: {
        isEditing: grid.isEditing,
        values,
        rows,
        columns,
        selection,
      },
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
      left: css({
        position: 'relative',
        width: 200,
        padding: 10,
        lineHeight: 1.6,
        Flex: 'vertical-spaceBetween',
        Scroll: true,
      }),
      leftTop: css({
        fontSize: 13,
      }),
      right: css({
        position: 'relative',
        flex: 1,
      }),

      rightInner: css({
        Absolute: 10,
        border: `solid 1px ${color.format(-0.2)}`,
      }),
      grid: css({
        Absolute: 0,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div {...styles.leftTop}>
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
            {this.button('values', () => (this.grid.values = { A1: 'loaded value' }))}
            {this.button('changeValues', () => this.grid.changeValues({ A1: 'hello' }))}
            {this.button('change values (via prop)', () =>
              this.test$.next({ values: { A1: 'happy' } }),
            )}
            <Hr margin={5} />
            {this.button('columns (width) - A:200', () =>
              this.test$.next({ columns: { A: { width: 200 } } }),
            )}
            {this.button('columns (width) - A:300', () =>
              this.test$.next({ columns: { A: { width: 300 } } }),
            )}
            {this.button('rows (height) - 1:0', () =>
              this.test$.next({ rows: { 1: { height: 0 } } }),
            )}
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
            {this.button('select column: B:B', () =>
              this.grid.select({ cell: 'B1', ranges: ['B:B'] }),
            )}
            {this.button('select row: 3:3', () =>
              this.grid.select({ cell: 'A3', ranges: ['3:3'] }),
            )}
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
          {this.renderState()}
        </div>
        <div {...styles.right}>
          <div {...styles.rightInner}>
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
      </div>
    );
  }

  private renderState() {
    return (
      <ObjectView
        name={'state'}
        data={this.state.data}
        expandPaths={['$', '$.grid', '$.grid.selection', '$.grid.selection.ranges']}
      />
    );
  }

  /**
   * [Handlers]
   */
  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} block={true} />;
  };
}
