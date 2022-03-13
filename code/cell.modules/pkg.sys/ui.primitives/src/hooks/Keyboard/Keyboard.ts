import { KeyboardEvents as Events } from './Keyboard.Events';
import { KeyboardStateMonitor } from './Keyboard.State';
import { KeyboardStateSingleton } from './Keyboard.State.Singleton';
import { EventProps } from './UI.EventProps';
import { useKeyboard } from './useKeyboard';
import { useKeyboardEventPipe as useEventPipe } from './useKeyboardEventPipe';

/**
 * Index of Keyboard tools.
 */
export const Keyboard = {
  Events,

  State: {
    singleton: KeyboardStateSingleton,
    Monitor: KeyboardStateMonitor,
  },

  useKeyboard,
  useEventPipe,

  UI: { EventProps },
};
