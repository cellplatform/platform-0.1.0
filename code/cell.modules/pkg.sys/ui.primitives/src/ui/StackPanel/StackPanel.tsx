import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, R, t, time } from '../common';
import { Panel } from './Panel';

type Index = number;
type Millisconds = number;
type Stage = t.StackPanelSlideEvent['stage'];
type IndexChange = { from: Index; to: Index };

export type StackPanelProps = {
  index?: Index;
  panels?: t.StackPanel[];
  duration?: Millisconds;
  style?: CssValue;
  onSlide?: t.StackPanelSlideEventHandler;
};

export const StackPanel: React.FC<StackPanelProps> = (props) => {
  const { panels = [], onSlide } = props;

  const total = panels.length;
  const index = toIndex(props.index, total);
  const duration = props.duration ?? 200;
  const [previous, setPrevious] = useState<number>(-1);
  const changedRef = useRef<Subject<IndexChange>>(new Subject<IndexChange>());

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    changedRef.current.next({ from: previous, to: index });
    setPrevious(index);
  }, [index]); // eslint-disable-line

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const $ = changedRef.current.pipe(takeUntil(dispose$));

    const fire = (stage: Stage, from: Index, to: Index) => onSlide?.({ stage, from, to });
    $.subscribe((e) => {
      fire('start', e.from, e.to);
      time.delay(duration, () => fire('complete', e.from, e.to));
    });

    return () => dispose$.next();
  }, [duration]); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      overflow: 'hidden',
    }),
  };

  const toPanel = (data: t.StackPanel, i: Index) => (
    <Panel key={i} index={i} current={index} previous={previous} data={data} duration={duration} />
  );

  const elPanels = panels.map(toPanel).reverse();
  return <div {...css(styles.base, props.style)}>{elPanels}</div>;
};

/**
 * [Helpers]
 */

function toIndex(index: number | undefined, total: number) {
  const result = index === undefined ? (total === 0 ? -1 : 0) : index;
  return result < 0 ? -1 : R.clamp(0, total - 1, result);
}
