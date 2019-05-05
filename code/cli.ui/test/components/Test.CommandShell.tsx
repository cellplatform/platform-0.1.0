import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { css, CommandShell, t } from '../common';

export type ITestCommandShellProps = {};

export class TestShell extends React.PureComponent<ITestCommandShellProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli = cli.init({ state$: this.state$, getState: () => this.state });

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
    const { tree = {} } = this.state;
    const styles = {
      body: css({ padding: 30 }),
    };
    return (
      <CommandShell cli={this.cli} tree={tree} localStorage={true}>
        <div {...styles.body}>{this.state.el}</div>
      </CommandShell>
    );
  }
}
