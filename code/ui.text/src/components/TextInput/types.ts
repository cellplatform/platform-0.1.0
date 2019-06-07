import { ITextStyle } from '../../types';

export type ITextModifierKeys = {
  alt: boolean;
  control: boolean;
  shift: boolean;
  meta: boolean;
};

export interface ITextInputFocus {
  focusOnLoad?: boolean;
  focusAction?: 'SELECT' | 'END';
}

export interface ITextInputMask {
  text: string;
  char: string;
}
export type TextInputMaskHandler = (e: ITextInputMask) => boolean; // True - OK, False - disallow.

export interface ITextInputStyle extends ITextStyle {
  disabledColor?: number | string;
}

/**
 * [Events]
 */

export type TextInputChangeEvent = {
  from: string;
  to: string;
  char: string;
  isMax: boolean | null;
  modifierKeys: ITextModifierKeys;
};
export type TextInputChangeEventHandler = (e: TextInputChangeEvent) => void;

export type TextInputTabEvent = {
  isCancelled: boolean;
  cancel(): void;
  modifierKeys: ITextModifierKeys;
};
export type TextInputTabEventHandler = (e: TextInputTabEvent) => void;

export type TextInputKeyEvent = React.KeyboardEvent<HTMLInputElement> & {
  modifierKeys: ITextModifierKeys;
};
export type TextInputKeyEventHandler = (e: TextInputKeyEvent) => void;

export interface ITextInputEvents {
  onChange?: TextInputChangeEventHandler;
  onKeyPress?: TextInputKeyEventHandler;
  onKeyDown?: TextInputKeyEventHandler;
  onKeyUp?: TextInputKeyEventHandler;
  onEnter?: TextInputKeyEventHandler;
  onTab?: TextInputTabEventHandler;
  onFocus?: React.EventHandler<React.FocusEvent<HTMLInputElement>>;
  onBlur?: React.EventHandler<React.FocusEvent<HTMLInputElement>>;
}

/**
 * [Event] Observable
 */
export type TextInputEvent =
  | ITextInputChangingEvent
  | ITextInputChangedEvent
  | ITextInputKeypressEvent;

export type ITextInputChangingEvent = {
  type: 'TEXT_INPUT/changing';
  payload: ITextInputChanging;
};
export type ITextInputChanging = TextInputChangeEvent & {
  isCancelled: boolean;
  cancel(): void;
};

export type ITextInputChangedEvent = {
  type: 'TEXT_INPUT/changed';
  payload: ITextInputChanged;
};
export type ITextInputChanged = TextInputChangeEvent;

export type ITextInputKeypressEvent = {
  type: 'TEXT_INPUT/keypress';
  payload: ITextInputKeypress;
};
export type ITextInputKeypress = {
  isPressed: boolean;
  key: TextInputKeyEvent['key'];
  event: TextInputKeyEvent;
};
