import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';

import { css, t, time } from '../common';

type Index = number;
type Millisconds = number;
type OffsetEdge = 'OFFSET_LEFT' | 'OFFSET_RIGHT';

export type PanelProps = {
  data: t.StackPanel;
  index: Index;
  current: Index;
  previous: Index;
  duration: Millisconds;
};

/**
 * A single panel within a stack.
 */
export const Panel: React.FC<PanelProps> = (props) => {
  const { data, duration } = props;
  const [offset, setOffset] = useState<number>();
  const [opacity, setOpacity] = useState<number>();

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    let isDisposed = false;
    const updateState = () => {
      if (isDisposed) return;
      const edge = toEdge(props);
      const offset = toOffset(edge);
      const opacity = toOffsetOpacity(props.data, edge);
      setOffset(offset);
      setOpacity(opacity);
    };

    // Set initial panel position (prior to first render).
    setOffset(toOffset(toEdge(props)));

    // NB:  Allow the first render to occur, which may have the panel off screen.
    //      Then re-calculate the position of the panel to allow it to slide
    //      in if necessary.
    time.delay(0, updateState);

    return () => {
      isDisposed = true;
    };
  }, [props.current]); // eslint-disable-line

  /**
   * [Render]
   */
  if (offset === undefined) return null;

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
};

/**
 * [Helpers]
 */

function toEdge(args: { index: Index; current: Index }): OffsetEdge | undefined {
  const current = args.current < 0 ? 0 : args.current;
  if (current === args.index) {
    return undefined; // Currently visible.
  } else {
    return args.index < current ? 'OFFSET_LEFT' : 'OFFSET_RIGHT';
  }
}

function toOffset(edge?: OffsetEdge) {
  if (edge === 'OFFSET_LEFT') return -1;
  if (edge === 'OFFSET_RIGHT') return 1;
  return 0;
}

function toOffsetOpacity(data: t.StackPanel, edge?: OffsetEdge) {
  const opacity = data.offsetOpacity ?? 1;
  return edge === 'OFFSET_LEFT' || edge === 'OFFSET_RIGHT' ? opacity : 1;
}
