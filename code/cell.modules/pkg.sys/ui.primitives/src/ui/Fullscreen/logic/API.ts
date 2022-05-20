import { RefObject } from 'react';
import { t } from '../common';

/**
 * See:
 *    WebStandard: Fullscreen API
 *    https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 *
 *    Spec:
 *    https://fullscreen.spec.whatwg.org
 */
export function FullscreenAPI<H extends HTMLElement = HTMLDivElement>(args: {
  ref: RefObject<H>;
}): t.Fullscreen<H> {
  const { ref } = args;
  const isFullscreen = () => Boolean(ref.current && document.fullscreenElement === ref.current);

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
     * Request that the element enter fullscreen mode.
     */
    async enter() {
      await ref.current?.requestFullscreen({ navigationUI: 'hide' });
    },

    /**
     * Request to exit full screen mode.
     */
    async exit() {
      if (isFullscreen()) document.exitFullscreen();
    },

    /**
     * Request [enter] or [exit] fullscreen depending on current state.
     */
    async toggle() {
      const from = api.isFullscreen;
      const to = !from;
      if (to) await api.enter();
      if (!to) await api.exit();
      return { from, to };
    },
  };

  return api;
}
