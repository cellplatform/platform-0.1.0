import { UIEvents as Events } from './UIEvent.Events';
import { useUIEventPipe as useEventPipe } from './useUIEventPipe';
import { Util } from './util';

const { isLeftButton } = Util;

/**
 * Index of tools for operating on [UIEvent]'s.
 * REF
 *   https://developer.mozilla.org/en-US/docs/Web/API/UIEvent
 */
export const UIEvent = {
  Events,
  useEventPipe,
  isLeftButton,
};
