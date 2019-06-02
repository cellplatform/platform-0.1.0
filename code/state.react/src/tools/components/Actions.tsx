import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, t, GlamorValue } from '../common';
import { Action } from './Action';

export type IActionsProps = {
  total: number;
  events: t.IStoreEvent[];
  style?: GlamorValue;
};
export type IActionsState = {};

export class Actions extends React.PureComponent<IActionsProps, IActionsState> {
  public state: IActionsState = {};
  private state$ = new Subject<Partial<IActionsState>>();
  private unmounted$ = new Subject();

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
    const styles = {
      base: css({}),
    };
    const { total, events } = this.props;
    const start = Math.max(0, total - events.length);
    const elList = events.map((e, i) => {
      const index = start + i;
      return <Action key={index} event={e} index={index} />;
    });
    return <div {...styles.base}>{elList}</div>;
  }
}
