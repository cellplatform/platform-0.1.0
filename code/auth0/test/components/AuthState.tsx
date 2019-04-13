import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, ObjectView, t } from '../common';

export type IAuthStateProps = {
  data?: object;
  style?: GlamorValue;
};

export class AuthState extends React.PureComponent<IAuthStateProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    state$.subscribe(e => this.forceUpdate());
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
    const data = { ...(this.props.data || {}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <ObjectView name={'auth'} data={data} />
      </div>
    );
  }
}
