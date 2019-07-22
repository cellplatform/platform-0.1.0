import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { CommandShell, t, ObjectView, Hr, renderer } from '../common';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<t.ITestState>>();

  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;
  private cli: t.ICommandState = cli.init({ state$: this.state$, ipc: this.context.ipc });

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
    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <div style={{ padding: 30, flex: 1 }}>
          <h1>Local</h1>
          <Hr />
          <ObjectView name={'state'} data={this.state} />
        </div>
      </CommandShell>
    );
  }
}
