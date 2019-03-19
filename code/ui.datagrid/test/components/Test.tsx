import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, Button } from './common';
import { Test as TestGrid } from './Test.Grid';

export type ITestProps = {};
export type ITestState = {};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();

  private testGrid!: TestGrid;
  private testGridRef = (ref: TestGrid) => (this.testGrid = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
          {this.button('loadValues', () => this.grid.loadValues({ A3: 123 }))}
          {this.button('changeValues', () => this.grid.changeValues({ A1: 'hello' }))}
          {this.button('change values (prop)', () =>
            this.testGrid.state$.next({ values: { A1: 'happy' } }),
          )}
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
}
