import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, Conversation, css, ObjectView, t } from '../common';

export type ITestProps = { store: t.IThreadStore };
export type ITestState = {};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();
  private store = this.props.store;
  private store$ = this.store.events$.pipe(takeUntil(this.unmounted$));

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const store$ = this.store$;

    state$.subscribe(e => this.setState(e));
    store$.subscribe(e => this.forceUpdate());
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
        flex: 1,
        Flex: 'horizontal',
      }),
      left: css({
        flex: 1,
        Flex: 'vertical-center-stretch',
      }),
      body: css({
        width: 760,
        flex: 1,
        display: 'flex',
      }),
      right: css({
        boxSizing: 'border-box',
        width: 280,
        padding: 8,
        borderLeft: `solid 1px ${color.format(-0.1)}`,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <div {...styles.body}>
            <Conversation />
          </div>
        </div>
        <div {...styles.right}>
          <ObjectView name={'state'} data={this.store.state} />
        </div>
      </div>
    );
  }
}
