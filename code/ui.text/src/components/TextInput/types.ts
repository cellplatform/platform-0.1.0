import { ITextStyle } from '../../types';

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

export type TextInputChangeEvent = {
  from: string;
  to: string;
  char: string;
  isMax: boolean | null;
};
export type TextInputChangeEventHandler = (e: TextInputChangeEvent) => void;

export type TextInputTabEvent = {
  cancel: () => void;
};
export type TextInputTabEventHandler = (e: TextInputTabEvent) => void;

export interface ITextInputEvents {
  onChange?: TextInputChangeEventHandler;
  onKeyPress?: React.EventHandler<React.KeyboardEvent<HTMLInputElement>>;
  onKeyDown?: React.EventHandler<React.KeyboardEvent<HTMLInputElement>>;
  onKeyUp?: React.EventHandler<React.KeyboardEvent<HTMLInputElement>>;
  onFocus?: React.EventHandler<React.FocusEvent<HTMLInputElement>>;
  onBlur?: React.EventHandler<React.FocusEvent<HTMLInputElement>>;
  onEnter?: React.EventHandler<React.KeyboardEvent<HTMLInputElement>>;
  onTab?: TextInputTabEventHandler;
}
