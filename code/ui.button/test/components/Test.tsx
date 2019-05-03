import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { log, LinkButton, constants, css, Shell, t, value } from '../common';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli: t.ICommandState = cli.init({ state$: this.state$ });

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
    const isEnabled = value.defaultValue(this.state.isEnabled, true);
    const styles = {
      base: css({
        flex: 1,
        padding: 30,
      }),
    };
    return (
      <Shell cli={this.cli} tree={{}}>
        <div {...styles.base}>
          <LinkButton label={'Click Me'} onClick={this.handleClick} isEnabled={isEnabled} />
        </div>
      </Shell>
    );
  }

  private handleClick = () => {
    log.info('click');
  };
}
