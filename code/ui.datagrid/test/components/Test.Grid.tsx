import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Button, color, css, GlamorValue, ObjectView } from '../common';
import { TestGridView } from './Test.Grid.view';

export type ITestGridProps = { style?: GlamorValue };
export type ITestGridState = {
  data?: any;
};

export class TestGrid extends React.PureComponent<ITestGridProps, ITestGridState> {
  public state: ITestGridState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestGridState>>();

  private testGrid!: TestGridView;
  private testGridRef = (ref: TestGridView) => (this.testGrid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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

  /**
   * [Methods]
   */
  public updateState() {
    const grid = this.grid;
    const { selection, values } = grid;
    const data = {
      isEditing: grid.isEditing,
      values,
      selection,
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
      }),
      left: css({
        position: 'relative',
        width: 200,
        padding: 10,
        lineHeight: 1.6,
        Flex: 'vertical-spaceBetween',
      }),
      leftTop: css({
        fontSize: 13,
      }),
      right: css({
        position: 'relative',
        flex: 1,
      }),
      grid: css({
        Absolute: 10,
        border: `solid 1px ${color.format(-0.2)}`,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div {...styles.leftTop}>
            {this.button('focus', () => this.grid.focus())}
            {this.button('loadValues', () => this.grid.loadValues({ A3: 123 }))}
            {this.button('changeValues', () => this.grid.changeValues({ A1: 'hello' }))}
            {this.button('change values (prop)', () =>
              this.testGrid.state$.next({ values: { A1: 'happy' } }),
            )}
            {this.button('select: A1', () => this.grid.select({ cell: 'A1' }))}
            {this.button('select: A1 and range', () =>
              this.grid.select({ cell: 'A1', ranges: ['B2:C4', 'C2:D7'] }),
            )}
            {this.button('select: bottom/right', () =>
              this.grid.select({
                cell: { row: this.grid.totalRows, column: this.grid.totalColumns },
              }),
            )}
            {this.button('scrollTo: A1', () => this.grid.scrollTo({ cell: 'A1' }))}
            {this.button('scrollTo: B5', () => this.grid.scrollTo({ cell: 'B5' }))}
            {this.button('scrollTo: bottom/right', () =>
              this.grid.scrollTo({
                cell: { row: this.grid.totalRows, column: this.grid.totalColumns },
              }),
            )}
          </div>
          <ObjectView
            name={'grid'}
            data={this.state.data}
            expandPaths={['$', '$.selection', '$.selection.ranges']}
          />
        </div>
        <div {...styles.right}>
          <TestGridView ref={this.testGridRef} style={styles.grid} />
        </div>
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
