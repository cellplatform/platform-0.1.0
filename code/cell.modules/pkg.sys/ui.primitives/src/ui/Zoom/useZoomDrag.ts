import React, { useEffect } from 'react';
import { animationFrameScheduler, Subject } from 'rxjs';
import { filter, observeOn, takeUntil } from 'rxjs/operators';

import { defaultValue, drag } from '../../common';

type Offset = { x: number; y: number };

/**
 * Hook for reacting to drag transformations.
 */
export function useZoomDrag(args: {
  ref: React.RefObject<HTMLElement>;
  zoom?: number;
  offset?: Offset;
  min?: { zoom?: number; offset?: Partial<Offset> };
  max?: { zoom?: number; offset?: Partial<Offset> };
  onZoom?: (e: { initial: number; next: number }) => void;
  onPan?: (e: { initial: Offset; next: Offset }) => void;
  canZoom?: (e: { mouse: MouseEvent }) => boolean;
  canPan?: (e: { mouse: MouseEvent }) => boolean;
}) {
  useEffect(() => {
    const zoom = defaultValue(args.zoom, 1);
    const minZoom = defaultValue(args.min?.zoom, 0);
    const maxZoom = args.max?.zoom;

    const offset = args.offset || { x: 0, y: 0 };
    const minOffset = args.min?.offset;
    const maxOffset = args.max?.offset;

    const dispose$ = new Subject<void>();
    const el = args.ref.current as HTMLElement;

    const onMouseDown = (mouse: MouseEvent) => {
      const canZoom = () => (args.canZoom ? args.canZoom({ mouse }) : true);
      const canOffset = () => (args.canPan ? args.canPan({ mouse }) : true);

      const dragger = drag.position({ el });
      const startZoom = zoom;
      const startOffset = offset;

      const events$ = dragger.events$.pipe(takeUntil(dispose$), observeOn(animationFrameScheduler));
      const drag$ = events$.pipe(filter((e) => e.type === 'DRAG'));

      // Zoom.
      drag$.pipe(filter((e) => canZoom())).subscribe((e) => {
        const diff = e.delta.y / 100;
        let next = Math.max(minZoom, startZoom + diff);
        if (typeof maxZoom === 'number') next = Math.min(maxZoom, next);
        if (args.onZoom) args.onZoom({ initial: startZoom, next });
      });

      // Pan ({x,y} offset).
      drag$.pipe(filter((e) => canOffset())).subscribe((e) => {
        let x = e.delta.x + startOffset.x;
        let y = e.delta.y + startOffset.y;

        if (minOffset) {
          if (typeof minOffset.x === 'number') x = Math.max(minOffset.x, x);
          if (typeof minOffset.y === 'number') y = Math.max(minOffset.y, y);
        }

        if (maxOffset) {
          if (typeof maxOffset.x === 'number') x = Math.min(maxOffset.x, x);
          if (typeof maxOffset.y === 'number') y = Math.min(maxOffset.y, y);
        }

        const next = { x, y };
        if (args.onPan) args.onPan({ initial: startOffset, next });
      });
    };

    const preventDefault = (e: MouseEvent) => {
      // NB: Dragging is handled on the mouse-down event.
      //     Cancel the default drag behavior to allow that handler to operate.
      e.preventDefault();
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('dragstart', preventDefault);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('dragstart', preventDefault);
    };
  });
}
