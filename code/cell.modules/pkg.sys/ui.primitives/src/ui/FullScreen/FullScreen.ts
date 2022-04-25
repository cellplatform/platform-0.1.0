import { useFullscreen } from './useFullscreen';
import { FullscreenEvents as Events } from './Fullscreen.Events';

/**
 * Helpers for moving the UI into "fullscreen" mode.
 *
 * See:
 *    WebStandard: Fullscreen API
 *    https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 *
 *    Spec:
 *    https://fullscreen.spec.whatwg.org
 *
 */
export const Fullscreen = {
  Events,
  useFullscreen,
};
