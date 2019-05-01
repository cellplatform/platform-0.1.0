import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { GlamorValue, Shell } from '../common';

export type ITestShellProps = { style?: GlamorValue };
export type ITestShellState = {};

export class TestShell extends React.PureComponent<ITestShellProps, ITestShellState> {
  public state: ITestShellState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestShellState>>();
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
    return <Shell cli={this.cli} tree={{}} />;
  }
}
