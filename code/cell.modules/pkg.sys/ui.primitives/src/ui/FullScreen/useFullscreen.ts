import { RefObject, useEffect, useRef } from 'react';
import { Subject } from 'rxjs';

import { rx, t } from './common';
import { FullscreenAPI } from './Fullscreen.API';
import { FullscreenEvents } from './Fullscreen.Events';

/**
 * Hook for binding a UI element [ref] to the Browser Fullscreen API.
 *
 * See:
 *    WebStandard: Fullscreen API
 *    https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 *
 *    Spec:
 *    https://fullscreen.spec.whatwg.org
 *
 */
export function useFullscreen<H extends HTMLElement = HTMLDivElement>(
  options: { ref?: RefObject<H>; instance?: t.FullscreenInstance } = {},
) {
  const _ref = useRef<H>(null);
  const ref = options.ref || _ref;
  const api = useRef(FullscreenAPI({ ref }));

  /**
   * Controller (Event Handlers)
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const instance = options.instance?.id ?? '';

    if (options.instance) {
      const events = FullscreenEvents({ instance: options.instance, dispose$ });
      const bus = rx.busAsType<t.FullscreenEvent>(options.instance.bus);

      /**
       * ENTER fullscreen.
       */
      events.enter.req$.subscribe(async (e) => {
        const { tx } = e;

        const fire = (error?: string) => {
          bus.fire({
            type: 'sys.ui.Fullscreen/enter:res',
            payload: { tx, instance, error },
          });
        };

        try {
          await api.current.enter();
          fire();
        } catch (err: any) {
          fire(err.message ?? 'Failed to enter fullscreen');
        }
      });

      /**
       * EXIT fullscreen.
       */
      events.exit.req$.subscribe(async (e) => {
        const { tx } = e;

        const fire = (error?: string) => {
          bus.fire({
            type: 'sys.ui.Fullscreen/exit:res',
            payload: { tx, instance, error },
          });
        };

        try {
          api.current.exit();
          fire();
        } catch (err: any) {
          fire(err.message ?? 'Failed to exit fullscreen');
        }
      });
    }

    return () => dispose$.next();
  }, [options.instance?.id]); // eslint-disable-line

  /**
   * API
   */
  return api.current;
}
