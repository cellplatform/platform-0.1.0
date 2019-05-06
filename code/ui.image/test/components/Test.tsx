import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { log, Avatar, constants, css, CommandShell, t } from '../common';

const PINK = '#CD638D';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {
    src: constants.URL.WOMAN_1,
    size: 64,
    borderRadius: 8,
    borderWidth: 5,
    borderColor: 0.2,
  };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private events$ = new Subject<t.AvatarEvent>();
  private cli: t.ICommandState = cli.init({ state$: this.state$ });

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    events$.subscribe(e => {
      log.info('🐷', e.type, e.payload);
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        backgroundColor: PINK,
        flex: 1,
        padding: 30,
      }),
    };
    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <div {...styles.base}>
          <Avatar {...this.state} events$={this.events$} />
        </div>
      </CommandShell>
    );
  }
}
