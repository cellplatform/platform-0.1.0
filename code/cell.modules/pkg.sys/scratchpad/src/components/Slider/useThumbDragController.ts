import React, { useEffect, useRef, useState } from 'react';
import { animationFrameScheduler } from 'rxjs';
import { filter, observeOn } from 'rxjs/operators';

import { drag } from '../../common';

/**
 * Controls the drag interaction of the slider [Thumb].
 */
export function useThumbDragController(args: {
  thumbRef?: React.RefObject<HTMLElement>;
  size: number;
}) {
  const [x, setX] = useState<number | undefined>();

  const startDrag = (e: MouseEvent) => {
    const el = args.thumbRef?.current as HTMLElement;

    if (el) {
      const dragger = drag.position({ el });

      const event$ = dragger.events$.pipe(observeOn(animationFrameScheduler));
      const drag$ = event$.pipe(filter((e) => e.type === 'DRAG'));

      drag$.subscribe((e) => {
        console.log('DRAG', e);

        let delta = e.delta.x;

        // if (delta < 0)
        delta = Math.max(0, delta);

        setX(delta);
      });
    }
  };

  useEffect(() => {
    console.log('useDragController');

    const el = args.thumbRef?.current as HTMLElement;

    el?.addEventListener('mousedown', startDrag);

    // setX

    return () => {
      el?.removeEventListener('mousedown', startDrag);
    };
  }, []); // eslint-disable-line

  return {
    x,
  };
}
