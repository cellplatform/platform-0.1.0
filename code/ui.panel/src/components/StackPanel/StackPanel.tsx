import * as React from 'react';

import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, map, filter, distinctUntilChanged, pairwise } from 'rxjs/operators';
import { R, css, GlamorValue, value, time } from '../../common';
import { IStackPanel, StackPanelSlideEvent, StackPanelSlideEventHandler } from './types';
import { Panel } from './components/Panel';

export type IStackPanelProps = {
  index?: number;
  panels?: IStackPanel[];
  duration?: number;
  style?: GlamorValue;
  onSlide?: StackPanelSlideEventHandler;
};

export class StackPanel extends React.PureComponent<IStackPanelProps> {
  /**
   * Prepares an index, ensuring it is within bounds.
   */
  public static index(props: IStackPanelProps) {
    const { index, panels = [] } = props;
    const result = index === undefined ? (panels.length === 0 ? -1 : 0) : index;
    return result < 0 ? -1 : R.clamp(0, panels.length - 1, result);
  }

  private get index() {
    return StackPanel.index(this.props);
  }

  private unmounted$ = new Subject();
  private props$ = new BehaviorSubject<IStackPanelProps>(this.props);

  public componentDidMount() {
    const props$ = this.props$.pipe(takeUntil(this.unmounted$));
    props$
      .pipe(
        filter(() => Boolean(this.props.onSlide)),
        map(e => StackPanel.index(e)),
        distinctUntilChanged((prev, next) => prev === next),
        pairwise(),
      )
      .subscribe(e => {
        const fire = (stage: StackPanelSlideEvent['stage']) => {
          const { onSlide } = this.props;
          if (onSlide) {
            onSlide({ stage, from: e[0], to: e[1] });
          }
        };
        fire('START');
        time.delay(this.duation, () => fire('COMPLETE'));
      });
  }

  public componentDidUpdate(prev: IStackPanelProps) {
    this.props$.next(this.props);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  private get duation() {
    return value.defaultValue(this.props.duration, 200);
  }

  public render() {
    const { panels = [] } = this.props;
    const index = this.index;
    const duration = this.duation;
    const styles = {
      base: css({
        position: 'relative',
        overflow: 'hidden',
      }),
    };
    const elPanels = panels
      .map((data, i) => {
        return <Panel key={i} index={i} current={index} data={data} duration={duration} />;
      })
      .reverse();
    // elPanels.reverse();

    return <div {...css(styles.base, this.props.style)}>{elPanels}</div>;
  }
}
