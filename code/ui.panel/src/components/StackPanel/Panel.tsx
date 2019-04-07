import * as React from 'react';

import { Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, delay } from 'rxjs/operators';
import { css, animation, value } from '../../common';
import { IStackPanel } from './types';

export interface IPanelProps {
  data: IStackPanel;
  index: number;
  current: number;
  duration: number;
}

type OffsetEdge = 'OFFSET_LEFT' | 'OFFSET_RIGHT';
export type IPanelState = {
  props$?: Subject<IPanelProps>;
  offset?: number;
  opacity?: number;
};

export class Panel extends React.PureComponent<IPanelProps, IPanelState> {
  /**
   * [Static]
   */

  private static edge(props: IPanelProps): OffsetEdge | undefined {
    const { current, index } = props;
    return current === index
      ? undefined // Currently visible.
      : index < current
      ? 'OFFSET_LEFT'
      : 'OFFSET_RIGHT';
  }

  /**
   * [Fields]
   */
  private props$ = new Subject<IPanelProps>();
  public state: IPanelState = {
    props$: this.props$,
    offset: this.offset,
    opacity: 1,
  };

  private stop$ = new Subject();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const props$ = this.props$.pipe(takeUntil(this.unmounted$));
    props$
      .pipe(
        distinctUntilChanged((p, n) => Panel.edge(p) === Panel.edge(n)),
        delay(0),
      )
      .subscribe(e => this.animate({ offset: this.offset }));
  }

  public static getDerivedStateFromProps(props: IPanelProps, state: IPanelState) {
    if (state.props$) {
      state.props$.next(props);
    }
    return null;
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  private get edge() {
    return Panel.edge(this.props);
  }

  private get offsetOpacity() {
    const { data } = this.props;
    const opacity = value.defaultValue(data.offsetOpacity, 1);
    switch (this.edge) {
      case 'OFFSET_LEFT':
      case 'OFFSET_RIGHT':
        return opacity;
      default:
        return 1;
    }
  }

  private get offset() {
    switch (this.edge) {
      case 'OFFSET_LEFT':
        return -1;
      case 'OFFSET_RIGHT':
        return 1;
      default:
        return 0;
    }
  }

  /**
   * [Methods]
   */

  private animate(args: { offset: number }) {
    this.stop$.next(); // Stop currently executing animation (if any).
    const current = () => this.state;
    const { duration } = this.props;
    const offset = args.offset;
    const opacity = this.offsetOpacity;
    const target = { offset, opacity };
    animation
      .start({ target, current, duration, type: 'easeInOut' })
      .pipe(
        takeUntil(this.stop$),
        takeUntil(this.unmounted$),
      )
      .subscribe({
        next: data => this.setState(data as any),
        complete: () => {
          // Done.
        },
      });
  }

  /**
   * [Render]
   */

  public render() {
    const { data } = this.props;
    const { offset = 0, opacity } = this.state;
    const styles = {
      base: css({
        Absolute: 0,
        display: 'flex',
        transform: `translateX(${offset * 100}%)`,
        opacity,
      }),
    };
    return <div {...styles.base}>{data.el}</div>;
  }
}
