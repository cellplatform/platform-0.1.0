import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { color, css, Button, ObjectView, t } from './common';
import { Test as TestGrid } from './Test.Grid';

export type ITestProps = {};
export type ITestState = {
  data?: any;
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();

  private testGrid!: TestGrid;
  private testGridRef = (ref: TestGrid) => (this.testGrid = ref);

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const events$ = this.grid.events$.pipe(takeUntil(this.unmounted$));
    events$.pipe().subscribe(() => this.updateState());
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
        Absolute: 0,
        backgroundColor: color.format(-0.08),
        Flex: 'horizontal',
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
            {this.button('loadValues', () => this.grid.loadValues({ A3: 123 }))}
            {this.button('changeValues', () => this.grid.changeValues({ A1: 'hello' }))}
            {this.button('change values (prop)', () =>
              this.testGrid.state$.next({ values: { A1: 'happy' } }),
            )}
            {this.button('select: A1', () => this.grid.select({ cell: 'A1' }))}
            {this.button('select: A1 and range', () =>
              this.grid.select({ cell: 'A1', ranges: ['B2:C4', 'C2:D7'] }),
            )}
          </div>
          <ObjectView
            data={this.state.data}
            expandPaths={['$', '$.selection', '$.selection.ranges']}
          />
        </div>
        <div {...styles.right}>
          <TestGrid ref={this.testGridRef} style={styles.grid} />
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private button = (label: string, handler: () => void) => {
    return (
      <div>
        <Button label={label} onClick={handler} />
      </div>
    );
  };

  private tmp = () => {
    this.grid.select({ cell: 'A1' });
  };
}
