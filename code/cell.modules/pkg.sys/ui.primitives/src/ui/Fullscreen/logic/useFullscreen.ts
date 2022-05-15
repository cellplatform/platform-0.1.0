import { RefObject, useEffect, useRef } from 'react';
import { Subject } from 'rxjs';

import { rx, t } from '../common';
import { FullscreenAPI } from './API';
import { FullscreenController } from './Controller';
import { FullscreenEvents } from './Events';

/**
 * Hook for binding a UI element [ref] to the Browser Fullscreen API.
 *
 * See:
 *
 *    WebStandard: Fullscreen API
 *    https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 *
 *    Spec:
 *    https://fullscreen.spec.whatwg.org
 *
 */
export function useFullscreen<H extends HTMLElement = HTMLDivElement>(
  options: {
    ref?: RefObject<H>;
    instance?: t.FullscreenInstance;
    onChanged?: (e: t.FullscreenChanged) => void;
  } = {},
): t.Fullscreen<H> {
  const { instance, onChanged } = options;

  const _ref = useRef<H>(null);
  const ref = options.ref || _ref;
  const api = FullscreenAPI({ ref });

  useEffect(() => {
    const dispose$ = new Subject<void>();
    if (instance) {
      FullscreenController({ ref, instance, dispose$ });
      FullscreenEvents({ instance, dispose$ }).changed.$.subscribe((e) => onChanged?.(e));
    }
    return () => rx.done(dispose$);
  }, [instance?.id]); // eslint-disable-line

  /**
   * API
   */
  return api;
}
