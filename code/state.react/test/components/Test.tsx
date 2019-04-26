import * as React from 'react';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Button, ObjectView, Shell, css, GlamorValue, t } from './common';

import * as cli from '../cli';

export type ITestProps = {};
export type ITestState = {};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();
  private cli!: t.ICommandState;

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.cli = cli.init({});

    // const cli$ = this.cli.events$.pipe(takeUntil(this.unmounted$));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({ padding: 20 }) };
    return (
      <Shell cli={this.cli} tree={{}}>
        <div {...styles.base}>hello</div>
      </Shell>
    );
  }
}
