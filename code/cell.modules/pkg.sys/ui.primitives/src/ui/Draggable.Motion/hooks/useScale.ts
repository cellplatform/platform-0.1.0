import { MotionValue } from 'framer-motion';
import { RefObject } from 'react';

import { useEventListener } from '../common';

type Direction = 'up' | 'down';

/**
 * Listen for `wheel` events on the given element ref and update the reported
 * scale state, accordingly.
 */
export function useScale(
  ref: RefObject<HTMLElement | null>,
  value: MotionValue<number>,
  options: { min?: number; max?: number; isEnabled?: boolean } = {},
) {
  const MIN = options.min ?? 0.5;
  const MAX = options.max ?? 3;
  const isEnabled = options.isEnabled ?? true;

  const updateScale = (e: { direction: Direction; interval: number }) => {
    if (!isEnabled) return;
    const { direction, interval } = e;

    const prev = value.get();
    let next: number;

    // Adjust up to or down to the maximum or minimum scale levels by `interval`.
    if (direction === 'up' && prev + interval < MAX) {
      next = prev + interval;
    } else if (direction === 'up') {
      next = MAX;
    } else if (direction === 'down' && prev - interval > MIN) {
      next = prev - interval;
    } else if (direction === 'down') {
      next = MIN;
    } else {
      next = prev;
    }

    value.set(next);
  };

  useEventListener(ref, 'wheel', (e) => {
    e.preventDefault();
    updateScale({
      direction: e.deltaY > 0 ? 'up' : 'down',
      interval: 0.05,
    });
  });
}
