import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { GlamorValue, CommandShell } from '../common';

export type ITestCommandShellProps = { style?: GlamorValue };
export type ITestCommandShellState = {};

export class TestShell extends React.PureComponent<ITestCommandShellProps, ITestCommandShellState> {
  public state: ITestCommandShellState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestCommandShellState>>();
  private cli = cli.init({});

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
    return <CommandShell cli={this.cli} tree={{}} />;
  }
}
