import { KeyboardEvents as Events } from './Keyboard.Events';
import { KeyboardStateMonitor as StateMonitor } from './Keyboard.State';
import { EventProps } from './UI.EventProps';
import { useKeyboard } from './useKeyboard';
import { useKeyboardPipe } from './useKeyboardPipe';

/**
 * Index of Keyboard tools.
 */
export const Keyboard = {
  Events,
  StateMonitor,

  useKeyboard,
  useKeyboardPipe,

  UI: { EventProps },
};
