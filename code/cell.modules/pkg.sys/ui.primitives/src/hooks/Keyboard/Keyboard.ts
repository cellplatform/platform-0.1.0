import { useKeyboardPipe } from './useKeyboardPipe';
import { useKeyboard } from './useKeyboard';
import { KeyboardEvents as Events } from './Keyboard.Events';
import { KeyboardStateMonitor as StateMonitor } from './Keyboard.State';
import { EventProps } from './UI.EventProps';

/**
 * Index of Keyboard tools.
 */
export const Keyboard = {
  Events,
  StateMonitor,

  useKeyboardPipe,
  useKeyboard,

  UI: {
    EventProps,
  },
};
