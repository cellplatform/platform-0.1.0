import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { Shell, t } from '../common';
import { AuthState } from './AuthState';

const KEY = {
  CMD: 'AUTH0/test/cmd',
};

/**
 * Login Image
 * - https://user-images.githubusercontent.com/185555/56072416-b1e7ce00-5dea-11e9-946f-cdc54fadf0b3.png
 */

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
    console.log(`\nTODO 🐷  move CLI storage to @uiharness/ui \n`);
    cli$.subscribe(e => localStorage.setItem(KEY.CMD, this.cli.text));
  }

  public componentDidMount() {
    this.cli.change({ text: localStorage.getItem(KEY.CMD) || '', invoke: false });
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
