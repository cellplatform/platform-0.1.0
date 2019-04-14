import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { color, Shell, t, ObjectView, css } from '../common';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli: t.ICommandState = cli.init({ state$: this.state$ });

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal',
        boxSizing: 'border-box',
      }),
      left: css({
        flex: 1,
        borderRight: `solid 1px ${color.format(-0.1)}`,
        display: 'flex',
      }),
      right: css({
        width: 250,
        padding: 8,
        backgroundColor: color.format(-0.03),
      }),
    };
    return (
      <Shell cli={this.cli} tree={{}}>
        <div {...styles.base}>
          <div {...styles.left}>left</div>
          <div {...styles.right}>
            <ObjectView name={'state'} data={this.state} />
          </div>
        </div>
      </Shell>
    );
  }
}
