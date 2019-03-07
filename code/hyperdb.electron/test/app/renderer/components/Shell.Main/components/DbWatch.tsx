import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, CommandState, t } from '../../../common';
import { ObjectView } from '../../primitives';

export type IDbWatchProps = {
  cli: CommandState;
  db: t.ITestRendererDb;
  style?: GlamorValue;
};
export type IDbWatchState = {};

export class DbWatch extends React.PureComponent<IDbWatchProps, IDbWatchState> {
  public state: IDbWatchState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<IDbWatchState>();

  /**
   * [Lifecycle]
   */

  constructor(props: IDbWatchProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */

  public render() {
    const styles = {
      base: css({}),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>DbWatch</div>
      </div>
    );
  }
}
