import '../../node_modules/@platform/css/reset.css';

import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css } from './common';
import { Button } from './primitives';
import { Test as TestGrid } from './Test.Grid';

export type ITestProps = {};
export type ITestState = {};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();

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
          <div />
          <Button label={'Grid'} />
        </div>
        <div {...styles.right}>
          <TestGrid style={styles.grid} />
        </div>
      </div>
    );
  }
}
