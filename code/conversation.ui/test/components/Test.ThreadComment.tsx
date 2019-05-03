import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../common';

export type IThreadCommentProps = { style?: GlamorValue };
export type IThreadCommentState = {};

export class ThreadComment extends React.PureComponent<IThreadCommentProps, IThreadCommentState> {
  public state: IThreadCommentState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IThreadCommentState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>ThreadComment</div>
      </div>
    );
  }
}
