import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, ObjectView, t } from '../common';

export type IAuthStateProps = {
  data?: t.IWebAuthProps;
  style?: GlamorValue;
};

export class AuthState extends React.PureComponent<IAuthStateProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject<{}>();
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
   * [Properties]
   */
  public get profile() {
    const { data } = this.props;
    return data ? data.profile : undefined;
  }

  public get avatarUrl() {
    const profile = this.profile;
    return profile ? profile.picture : undefined;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
        Scroll: true,
      }),
      body: css({
        position: 'relative',
        Absolute: 20,
      }),
    };
    const data = this.props.data || {};
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <ObjectView name={'auth'} data={data} expandLevel={2} />
          {this.renderAvatar()}
        </div>
      </div>
    );
  }

  private renderAvatar() {
    const url = this.avatarUrl;
    if (!url) {
      return null;
    }
    const size = 45;
    const styles = {
      base: css({ Absolute: [0, 0, null, null] }),
      avatar: css({ width: size, height: size, borderRadius: 4 }),
    };
    return (
      <div {...styles.base}>
        <img src={url} {...styles.avatar} />
      </div>
    );
  }
}
