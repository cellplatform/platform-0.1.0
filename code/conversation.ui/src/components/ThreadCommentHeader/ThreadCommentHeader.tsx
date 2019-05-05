import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, GlamorValue, time } from '../../common';
import { Text } from '../primitives';

export type IThreadCommentHeaderProps = {
  name?: string;
  timestamp?: Date;
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
    return this.props.name || 'Unnamed';
  }

  public get elapsed() {
    const { timestamp } = this.props;
    return timestamp ? time.elapsed(timestamp) : undefined;
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
        flex: 1,
        margin: 14,
        fontSize: 14,
        userSelect: 'none',
      }),
      name: css({
        fontWeight: 'bold',
        userSelect: 'text',
      }),
    };

    return (
      <Text style={css(styles.base, this.props.style)}>
        <span {...styles.name}>{this.name}</span> {this.renderTimestamp()}
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
