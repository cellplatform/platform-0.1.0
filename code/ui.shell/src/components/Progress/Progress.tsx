import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { Context, css, GlamorValue, t } from '../common';

export type IProgressProps = {
  height?: number;
  color?: string;
  style?: GlamorValue;
};
export type IProgressState = {
  isRunning?: boolean;
  duration?: number; // msecs
};

export class Progress extends React.PureComponent<IProgressProps, IProgressState> {
  public state: IProgressState = {};
  private state$ = new Subject<Partial<IProgressState>>();
  private unmounted$ = new Subject<{}>();
  private timeout: NodeJS.Timeout | undefined;

  public static contextType = Context;
  public context!: t.IShellContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IProgressProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    const shell = this.context.shell;
    const progress = shell.events.progress;
    progress.start$
      .pipe(
        takeUntil(this.unmounted$),
        filter(e => !this.state.isRunning),
      )
      .subscribe(e => this.start(e));
    progress.complete$.pipe(takeUntil(this.unmounted$)).subscribe(() => this.stop());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get duration() {
    return this.state.duration || 1500;
  }

  /**
   * [Methods]
   */
  public start(options: { duration?: number } = {}) {
    this.stop();
    return new Promise(resolve => {
      const { duration } = options;
      this.state$.next({ isRunning: true, duration });
      this.timeout = setTimeout(() => {
        this.stop();
        resolve();
      }, this.duration);
    });
  }

  public stop() {
    this.state$.next({ isRunning: false });
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }

  /**
   * [Render]
   */
  public render() {
    const { height = 2 } = this.props;
    const isRunning = this.state.isRunning;
    const speed = this.duration;
    const styles = {
      base: css({
        height,
      }),
      thumb: css({
        width: `${isRunning ? 100 : 0}%`,
        height,
        transition: `width ${isRunning ? speed : 0}ms linear`,
        backgroundColor: 'red',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.thumb} />
      </div>
    );
  }
}
