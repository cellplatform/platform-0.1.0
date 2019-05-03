import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlamorValue, CommandShell, t } from '../common';

export type ITestCommandShellProps = { cli: t.ICommandState; testState: t.ITestState };
export type ITestCommandShellState = {};

export class TestShell extends React.PureComponent<ITestCommandShellProps, ITestCommandShellState> {
  public state: ITestCommandShellState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestCommandShellState>>();
  private cli = this.props.cli;

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
    const { testState } = this.props;
    return <CommandShell cli={this.cli} tree={testState.tree || {}} localStorage={true} />;
  }
}
