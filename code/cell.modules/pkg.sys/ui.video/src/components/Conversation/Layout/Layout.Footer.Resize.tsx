import React, { useEffect, useRef, useState } from 'react';
import { animationFrameScheduler } from 'rxjs';
import { filter, observeOn } from 'rxjs/operators';

import { css, CssValue, drag, defaultValue } from '../common';

export type LayoutFooterResizeProps = {
  percent?: number;
  style?: CssValue;
  onDragResize?: (args: { percent: number }) => void;
};

export const LayoutFooterResize: React.FC<LayoutFooterResizeProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState<number>(defaultValue(props.percent, 1));

  const startDrag = (e: React.MouseEvent) => {
    const isAltKeyPressed = e.altKey;

    const el = rootRef.current as HTMLDivElement;
    const dragger = drag.position({ el });
    const startZoom = zoom;

    const events$ = dragger.events$.pipe(observeOn(animationFrameScheduler));
    const drag$ = events$.pipe(filter((e) => e.type === 'DRAG'));

    drag$.pipe(filter((e) => isAltKeyPressed)).subscribe((e) => {
      const diff = e.delta.y / 100;
      const percent = Math.min(1.5, Math.max(0.1, startZoom + diff));
      setZoom(percent);
      if (props.onDragResize) props.onDragResize({ percent });
    });
  };

  const styles = {
    base: css({ flex: 1 }),
  };

  return (
    <div ref={rootRef} onMouseDown={startDrag} {...css(styles.base, props.style)}>
      <div />
    </div>
  );
};
