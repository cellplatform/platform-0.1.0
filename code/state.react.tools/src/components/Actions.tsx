import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t, value } from '../common';
import { Action } from './Action';

export type IActionsProps = {
  events: t.IStoreEvent[];
  total?: number;
  direction?: 'ASC' | 'DESC';
  style?: CssValue;
};
export type IActionsState = {};

export class Actions extends React.PureComponent<IActionsProps, IActionsState> {
  public state: IActionsState = {};
  private state$ = new Subject<Partial<IActionsState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
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
    const { direction = 'ASC' } = this.props;
    const styles = {
      base: css({}),
    };
    const { events = [] } = this.props;
    const total = value.defaultValue(this.props.total, events.length);
    const start = Math.max(0, total - events.length);

    let elList = events.map((e, i) => {
      const index = start + i;
      return <Action key={index} event={e} index={index} />;
    });

    elList = direction === 'DESC' ? elList.reverse() : elList;

    return <div {...css(styles.base, this.props.style)}>{elList}</div>;
  }
}
