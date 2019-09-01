import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, value, time } from '../../common';
import { IStackPanel } from './types';

type OffsetEdge = 'OFFSET_LEFT' | 'OFFSET_RIGHT';

export type IPanelProps = {
  data: IStackPanel;
  index: number;
  current: number;
  previous: number;
  duration: number;
};

export type IPanelState = {
  offset?: number;
  opacity?: number;
  edge?: OffsetEdge;
  isMounted?: boolean;
};

export class Panel extends React.PureComponent<IPanelProps, IPanelState> {
  /**
   * [Static]
   */

  public static edge(props: { index: number; current: number }): OffsetEdge | undefined {
    const { index } = props;
    const current = props.current < 0 ? 0 : props.current;
    if (current === index) {
      return undefined; // Currently visible.
    } else {
      return index < current ? 'OFFSET_LEFT' : 'OFFSET_RIGHT';
    }
  }

  public static offset(edge?: OffsetEdge) {
    switch (edge) {
      case 'OFFSET_LEFT':
        return -1;
      case 'OFFSET_RIGHT':
        return 1;
      default:
        return 0;
    }
  }

  /**
   * [Fields]
   */
  public state: IPanelState = { opacity: 1 };
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<IPanelState>>();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    // Set initial panel position (prior to first render).
    const { index, previous } = this.props;
    const edge = Panel.edge({ index, current: previous });
    const offset = Panel.offset(edge);
    this.setState({ edge, offset });

    time.delay(0, () => {
      // NB:  Allow the first render to occur, which may have the panel off screen.
      //      Then re-calculate the position of the panel to allow it to slide
      //      in if necessary.
      this.updateState();
    });
  }

  public componentDidUpdate(prev: IPanelProps) {
    if (prev.current !== this.props.current) {
      this.updateState();
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this.unmounted$.isStopped;
  }

  /**
   * [Methods]
   */

  public updateState() {
    const edge = Panel.edge(this.props);
    const offset = Panel.offset(edge);
    const opacity = this.offsetOpacity(edge);
    this.state$.next({ edge, offset, opacity });
  }

  private offsetOpacity(edge?: OffsetEdge) {
    const { data } = this.props;
    const opacity = value.defaultValue(data.offsetOpacity, 1);
    switch (edge) {
      case 'OFFSET_LEFT':
      case 'OFFSET_RIGHT':
        return opacity;
      default:
        return 1;
    }
  }

  /**
   * [Render]
   */

  public render() {
    const { data, duration } = this.props;
    const { offset, opacity } = this.state;

    if (offset === undefined) {
      return null;
    }

    const styles = {
      base: css({
        Absolute: 0,
        display: 'flex',
        opacity,
        transform: `translateX(${offset * 100}%)`,
        transition: `transform ${duration}ms, opacity ${duration}ms`,
      }),
    };

    return <div {...styles.base}>{data.el}</div>;
  }
}
