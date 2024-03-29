import { KeyboardEvents as Events } from './Keyboard.Events';
import { KeyboardStateMonitor } from './Keyboard.State';
import { KeyboardStateSingleton } from './Keyboard.State.Singleton';
import { EventProps } from './ui/EventProps';
import { useKeyboardEventPipe as useEventPipe } from './useKeyboardEventPipe';
import { useKeyboardState } from './useKeyboardState';
import { useKeyboard } from './useKeyboard';

/**
 * Index of Keyboard tools.
 */
export const Keyboard = {
  Events,

  State: {
    singleton: KeyboardStateSingleton,
    Monitor: KeyboardStateMonitor,
  },

  useKeyboard, //       Does NOT cause redraws.
  useKeyboardState, //  Does causes redraws (intentionally by design).
  useEventPipe,

  UI: { EventProps },
};
