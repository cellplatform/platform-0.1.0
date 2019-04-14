import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Button, color, css, GlamorValue, Hr, ObjectView, t } from '../common';
import { TestGridView } from './Test.Grid.view';

export type ITestGridProps = {
  editorType: t.TestEditorType;
  style?: GlamorValue;
};
export type ITestGridState = {
  data?: any;
};

export class TestGrid extends React.PureComponent<ITestGridProps, ITestGridState> {
  public state: ITestGridState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestGridState>>();
  private events$ = new Subject<t.GridEvent>();

  private testGrid!: TestGridView;
  private testGridRef = (ref: TestGridView) => (this.testGrid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    events$.subscribe(e => {
      console.log('🌳', e.type, e.payload);
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
            <Hr margin={5} />
            {this.button('scrollTo: A1', () => this.grid.scrollTo({ cell: 'A1' }))}
            {this.button('scrollTo: B5', () => this.grid.scrollTo({ cell: 'B5' }))}
            {this.button('scrollTo: bottom/right', () =>
              this.grid.scrollTo({
                cell: { row: this.grid.totalRows, column: this.grid.totalColumns },
              }),
            )}
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
