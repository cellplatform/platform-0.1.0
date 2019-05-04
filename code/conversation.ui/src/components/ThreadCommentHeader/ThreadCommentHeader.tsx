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
   * [Properties]
   */
  public get name() {
    return this.props.name || 'Unnamed';
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
    const { timestamp } = this.props;
    if (!timestamp) {
      return null;
    }
    const elapsed = time.elapsed(timestamp);
    return <span>commented {elapsed.toString()} ago</span>;
  }
}
