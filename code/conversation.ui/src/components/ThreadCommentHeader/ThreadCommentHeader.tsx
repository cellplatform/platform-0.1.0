import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, time, t, UserIdentity } from '../../common';
import { Text } from '../primitives';

export type IThreadCommentHeaderProps = {
  person?: t.IUserIdentity;
  timestamp?: number;
  style?: GlamorValue;
};
export type IThreadCommentHeaderState = {};

export class ThreadCommentHeader extends React.PureComponent<
  IThreadCommentHeaderProps,
  IThreadCommentHeaderState
> {
  public state: IThreadCommentHeaderState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IThreadCommentHeaderState>>();
  private redraw$ = new Subject();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const redraw$ = this.redraw$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    redraw$.subscribe(() => {
      this.forceUpdate();
      this.startRedrawTimer();
    });
  }

  public componentDidMount() {
    this.startRedrawTimer();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get name() {
    return UserIdentity.toName(this.props.person);
  }

  public get date() {
    const { timestamp } = this.props;
    return timestamp ? time.fromTimestamp(timestamp) : undefined;
  }

  public get elapsed() {
    const date = this.date;
    return date ? time.elapsed(date) : undefined;
  }

  /**
   * Methods
   */
  public startRedrawTimer() {
    if (this.props.timestamp) {
      const SEC = 1000;
      time.delay(SEC * 10, () => this.redraw$.next());
    }
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
        margin: 14,
        fontSize: 14,
        userSelect: 'none',
        display: 'flex',
        minHeight: 20,
      }),
      outer: css({
        flex: 1,
        Absolute: 0,
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }),
      name: css({
        fontWeight: 'bold',
        userSelect: 'text',
      }),
    };

    return (
      <Text style={css(styles.base, this.props.style)}>
        <div {...styles.outer}>
          <span {...styles.name}>{this.name}</span> {this.renderTimestamp()}
        </div>
      </Text>
    );
  }

  private renderTimestamp() {
    const elapsed = this.elapsed;
    if (!elapsed) {
      return null;
    }
    const msg = elapsed.min < 1 ? 'just now' : `${elapsed.toString()} ago`;
    return <span>commented {msg}</span>;
  }
}
