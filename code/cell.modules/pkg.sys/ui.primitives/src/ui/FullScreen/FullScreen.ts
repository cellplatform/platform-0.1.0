import { FullscreenAPI as API } from './logic/API';
import { FullscreenController as Controller } from './logic/Controller';
import { FullscreenEvents as Events } from './logic/Events';
import { useFullscreen } from './logic/useFullscreen';

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
  API,
  Events,
  Controller,
  useFullscreen,
};
