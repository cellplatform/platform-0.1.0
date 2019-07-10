import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import renderer from '@platform/electron/lib/renderer';

import * as cli from '../cli';
import { CommandShell, t, ObjectView, Hr } from '../common';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli: t.ICommandState = cli.init({
    ipc: this.context.ipc,
    state$: this.state$,
    getState: () => this.state,
  });

  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

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
          <ObjectView name={'state'} data={this.state} expandLevel={5} />
        </div>
      </CommandShell>
    );
  }
}
