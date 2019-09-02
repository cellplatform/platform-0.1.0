import * as React from 'react';
import { Subject, VirtualTimeScheduler } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { time, Context, css, GlamorValue, t } from '../common';

export type IProgressProps = {
  height?: number;
  style?: GlamorValue;
};
export type IProgressState = {
  inProgress?: boolean;
  duration?: number; // msecs
  color?: string;
};

export class Progress extends React.PureComponent<IProgressProps, IProgressState> {
  public state: IProgressState = {};
  private state$ = new Subject<Partial<IProgressState>>();
  private unmounted$ = new Subject<{}>();
  private timeout: NodeJS.Timeout | undefined;
  private stopId = -1;

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
        filter(e => !this.state.inProgress),
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
    return this.state.duration || 1000;
  }

  public get color() {
    return this.state.color || 'red';
  }

  /**
   * [Methods]
   */
  public start(options: { duration?: number; color?: string } = {}) {
    return new Promise(resolve => {
      const { duration, color } = options;
      this.state$.next({ duration, color });

      // Stop any current progress and keep a reference to the current "stop id".
      this.stop();
      this.stopId++;
      const op = this.stopId;

      // NB: Wait a tick after the duration is set to
      //     ensure the CSS duation time is updated.
      time.delay(0, () => {
        // If the operation has been stoped before the
        // tick completed do not continue.
        if (this.stopId !== op) {
          return resolve();
        }

        this.state$.next({ inProgress: true });
        this.timeout = setTimeout(() => {
          this.stop();
          resolve();
        }, this.duration);
      });
    });
  }

  public stop() {
    this.state$.next({ inProgress: false });
    this.stopId++;
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
    const isRunning = this.state.inProgress;
    const speed = this.duration;
    const styles = {
      base: css({
        height,
        pointerEvents: 'none',
      }),
      thumb: css({
        width: `${isRunning ? 100 : 0}%`,
        height,
        transition: `width ${isRunning ? speed : 0}ms linear`,
        backgroundColor: this.color,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.thumb} />
      </div>
    );
  }
}
