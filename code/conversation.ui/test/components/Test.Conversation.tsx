import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { color, CommandShell, t, ObjectView, Hr, css, Conversation } from '../common';

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
      }),
      left: css({
        flex: 1,
        Flex: 'vertical-center-stretch',
      }),
      body: css({
        width: 760,
        flex: 1,
        display: 'flex',
      }),
      right: css({
        boxSizing: 'border-box',
        width: 280,
        padding: 8,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div {...styles.body}>
            <Conversation />
          </div>
        </div>
        <div {...styles.right}>
          <ObjectView name={'state'} data={this.state} />
        </div>
      </div>
    );
  }
}
