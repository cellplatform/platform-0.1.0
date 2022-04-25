import { RefObject } from 'react';
import { Subject } from 'rxjs';

import { t, rx } from './common';
import { FullscreenEvents } from './Fullscreen.Events';

/**
 * See:
 *    WebStandard: Fullscreen API
 *    https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 *
 *    Spec:
 *    https://fullscreen.spec.whatwg.org
 */
export function FullscreenAPI<H extends HTMLElement = HTMLDivElement>(args: { ref: RefObject<H> }) {
  const { ref } = args;
  const isFullscreen = () => document.fullscreenElement === ref.current;

  /**
   * API
   */
  const api = {
    ref,

    /**
     * Report the state of the [ref] element as to
     * whether it is currently in fullscreen mode.
     */
    get isFullscreen() {
      return isFullscreen();
    },

    /**
     *
     */
    async enter() {
      await ref.current?.requestFullscreen({ navigationUI: 'hide' });
    },

    exit() {
      if (isFullscreen()) document.exitFullscreen();
    },
  };

  return api;
}
