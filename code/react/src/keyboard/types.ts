import { IKeypressEvent } from '../events/types';
import { Observable } from 'rxjs';
export { IKeypressEvent };

export type KeyCommand = string;
export type KeyBindings<T extends KeyCommand> = Array<KeyBinding<T>>;
export type KeyBinding<T extends KeyCommand> = {
  command: T;
  key: string; // Key combination, eg: 'CMD+W' or 'META+W' or 'SHIFT+G'
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
  cancel(): void;
};

/**
 * Keyboard command manager.
 */
export type IKeyboardArgs<T extends KeyCommand> = {
  bindings?: KeyBindings<T>;
  keyPress$?: Observable<IKeypressEvent>;
  dispose$?: Observable<any>;
};

export type IKeyboard<T extends KeyCommand> = {
  isDisposed: boolean;
  dispose$: Observable<{}>;
  dispose(): void;
  clone(options?: Partial<IKeyboardArgs<T>>): IKeyboard<T>;
  filter(fn: (e: IKeypressEvent) => boolean): IKeyboard<T>;
  takeUntil(dispose$: Observable<any>): IKeyboard<T>;
};
