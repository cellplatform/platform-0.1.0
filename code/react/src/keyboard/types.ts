import { IKeypressEvent } from '../events/types';
export { IKeypressEvent };

export type KeyCommand = string;

export type KeyBindings<T extends KeyCommand> = Array<KeyBinding<T>>;

export type KeyBinding<T extends KeyCommand> = {
  key: string; // Key combination, eg: 'CMD+W' or 'META+W' or 'SHIFT+G'
  command: T;
};

export type KeyBindingEvent<T extends KeyCommand> = {
  command: T;
  key: string;
  preventDefault: () => void;
};
