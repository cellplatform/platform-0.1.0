import { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { DEFAULT, t } from './common';
import { Util } from './Util';

type Milliseconds = number;

/**
 * Cycles through a set of photos.
 */
export function useIndexSequence(
  args: {
    def?: t.PhotoDefInput;
    index?: number;
    enabled?: boolean;
    defaultDuration?: Milliseconds;
    loop?: boolean;
  } = {},
) {
  const { enabled = true, defaultDuration = DEFAULT.config.duration, loop = true } = args;
  const [index, setIndex] = useState(args.index ?? 0);
  const total = Util.toDefs(args.def).length;

  /**
   * Lifecycle
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();

    if (enabled && total > 0) {
      const defs = Util.toDefs(args.def);
      const def = defs[index];
      const msecs = def.duration ?? defaultDuration;

      interval(msecs)
        .pipe(takeUntil(dispose$), take(1))
        .subscribe(() => {
          const next = index + 1;
          const isEnd = next > total - 1;
          if (isEnd && !loop) return;
          setIndex(isEnd ? 0 : next);
        });
    }

    return () => dispose$.next();
  }, [enabled, index, total, loop]); // eslint-disable-line

  /**
   * API
   */
  return { index };
}
