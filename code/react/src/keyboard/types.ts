import { IKeypressEvent } from '../events/types';
export { IKeypressEvent };

export type KeyCommand = string;

export type KeyBindings<T extends KeyCommand> = Array<KeyBinding<T>>;

export type KeyBinding<T extends KeyCommand> = {
  key: string; // Key combination, eg: 'CMD+W' or 'META+W' or 'SHIFT+G'
  command: T;
};

export type ModifierKey = 'ALT' | 'CTRL' | 'SHIFT' | 'META';
export type IKeyPattern = { keys: string[]; modifiers: ModifierKey[] };
export type IKeyMatchEventArgs = {
  // NB: Subset of native [Keyboard] event.
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
};

/**
 * Fired when a key-binding is activated.
 */
export type IKeyBindingEvent<T extends KeyCommand> = {
  command: T;
  key: string;
  preventDefault(): void;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
};
