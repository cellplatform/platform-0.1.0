import { RefObject, useState } from 'react';
import { useEventListener } from '../common';

type Direction = 'up' | 'down';

/**
 * Listen for `wheel` events on the given element ref and update the reported
 * scale state, accordingly.
 */
export function useScale(
  ref: RefObject<HTMLElement | null>,
  options: { min?: number; max?: number; isEnabled?: boolean } = {},
) {
  const MIN_SCALE = options.min ?? 0.5;
  const MAX_SCALE = options.max ?? 3;
  const isEnabled = options.isEnabled ?? true;

  const [scale, setScale] = useState<number>(1);

  const updateScale = (e: { direction: Direction; interval: number }) => {
    if (!isEnabled) return;
    const { direction, interval } = e;
    setScale((prev) => {
      let scale: number;

      // Adjust up to or down to the maximum or minimum scale levels by `interval`.
      if (direction === 'up' && prev + interval < MAX_SCALE) {
        scale = prev + interval;
      } else if (direction === 'up') {
        scale = MAX_SCALE;
      } else if (direction === 'down' && prev - interval > MIN_SCALE) {
        scale = prev - interval;
      } else if (direction === 'down') {
        scale = MIN_SCALE;
      } else {
        scale = prev;
      }

      return scale;
    });
  };

  useEventListener(ref, 'wheel', (e) => {
    e.preventDefault();
    updateScale({
      direction: e.deltaY > 0 ? 'up' : 'down',
      interval: 0.1,
    });
  });

  return scale;
}
