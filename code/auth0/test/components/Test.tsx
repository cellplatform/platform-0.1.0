import * as React from 'react';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Button, ObjectView, Shell, css, GlamorValue, t } from '../common';
import { AuthState } from './AuthState';

import * as cli from '../cli';

const KEY = {
  CMD: 'AUTH0/test/cmd',
};

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli!: t.ICommandState;

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    this.cli = cli.init({ state$: this.state$ });
    const cli$ = this.cli.events$.pipe(takeUntil(this.unmounted$));

    // Save last CLI command to storage.
    console.log(`\nTODO 🐷  move this to @uiharness/ui \n`);
    cli$.subscribe(e => localStorage.setItem(KEY.CMD, this.cli.text));
    this.cli.change({ text: localStorage.getItem(KEY.CMD) });
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
      <Shell cli={this.cli} tree={{}}>
        <AuthState data={this.state.data} />
      </Shell>
    );
  }
}
