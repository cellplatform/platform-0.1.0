import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { CommandShell, t } from '../common';
import { AuthState } from './AuthState';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli = cli.init({ state$: this.state$ });

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <AuthState data={this.state.data} />
      </CommandShell>
    );
  }
}
