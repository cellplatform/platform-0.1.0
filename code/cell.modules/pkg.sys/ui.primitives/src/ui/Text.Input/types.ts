import { Subject } from 'rxjs';

import * as t from '../../common/types';

type Id = string;

export type TextInputInstance = { bus: t.EventBus<any>; id: Id };

/**
 * Component
 */

export type IInputValue = {
  value?: string;
  maxLength?: number;
  mask?: t.TextInputMaskHandler;
};

export type IHtmlInputProps = t.TextInputFocusAction &
  t.ITextInputEvents &
  IInputValue & {
    events$: Subject<t.TextInputEvent>;
    className?: string;
    isEnabled?: boolean;
    isPassword?: boolean;
    disabledOpacity?: number;
    style?: t.CssValue;
    valueStyle?: t.ITextInputStyle;
    selectionBackground?: number | string;
    spellCheck?: boolean;
    autoCapitalize?: boolean;
    autoCorrect?: boolean;
    autoComplete?: boolean;
    onDblClick?: React.MouseEventHandler;
  };
export type IHtmlInputState = {
  value?: string;
};

export type TextInputProps = t.TextInputFocusAction &
  t.ITextInputEvents &
  IInputValue & {
    instance?: TextInputInstance;
    events$?: Subject<t.TextInputEvent>;
    isEnabled?: boolean;
    isPassword?: boolean;
    isReadOnly?: boolean;
    disabledOpacity?: number;
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    autoSize?: boolean;
    placeholder?: string | React.ReactElement;
    valueStyle?: t.ITextInputStyle;
    placeholderStyle?: t.ITextInputStyle;
    spellCheck?: boolean;
    autoCapitalize?: boolean;
    autoCorrect?: boolean;
    autoComplete?: boolean;
    selectionBackground?: number | string;
    className?: string;
    style?: t.CssValue;
    onClick?: React.MouseEventHandler;
    onDoubleClick?: React.MouseEventHandler;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
  };

/**
 * Style
 */
export type TextStyle = {
  color?: number | string;
  fontSize?: number;
  fontWeight?: 'LIGHT' | 'NORMAL' | 'BOLD';
  fontFamily?: string;
  align?: 'LEFT' | 'CENTER' | 'RIGHT';
  italic?: boolean;
  letterSpacing?: number | string;
  lineHeight?: number | string;
  opacity?: number;
  textShadow?: string | Array<number | string>; // [0:offset-y, 1:color.format()]
  uppercase?: boolean;
};

export type TextProps = TextStyle & {
  className?: string;
  children?: React.ReactNode;
  block?: boolean;
  tooltip?: string;
  cursor?: string;
  isSelectable?: boolean;
  style?: t.CssValue;
  onClick?: React.MouseEventHandler;
  onDoubleClick?: React.MouseEventHandler;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};

/**
 * Input
 */
export type ITextModifierKeys = {
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
};

export type TextInputFocusAction = {
  selectOnFocus?: boolean;
  focusOnLoad?: boolean;
  focusAction?: 'SELECT' | 'END';
};

export type ITextInputMask = {
  text: string;
  char: string;
};
export type TextInputMaskHandler = (e: ITextInputMask) => boolean; // True - OK, False - disallow.

export type ITextInputStyle = t.TextStyle & { disabledColor?: number | string };

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

export type ITextInputEvents = {
  onChange?: TextInputChangeEventHandler;
  onKeyPress?: TextInputKeyEventHandler;
  onKeyDown?: TextInputKeyEventHandler;
  onKeyUp?: TextInputKeyEventHandler;
  onEnter?: TextInputKeyEventHandler;
  onEscape?: TextInputKeyEventHandler;
  onTab?: TextInputTabEventHandler;
  onFocus?: React.EventHandler<React.FocusEvent<HTMLInputElement>>;
  onBlur?: React.EventHandler<React.FocusEvent<HTMLInputElement>>;
};

/**
 * [Events]
 */
export type TextInputEvent =
  | ITextInputChangingEvent
  | ITextInputChangedEvent
  | ITextInputKeypressEvent
  | ITextInputFocusEvent
  | ITextInputLabelDblClickEvent;

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

export type ITextInputFocusEvent = {
  type: 'TEXT_INPUT/focus';
  payload: ITextInputFocus;
};
export type ITextInputFocus = { isFocused: boolean };

export type ITextInputLabelDblClickEvent = {
  type: 'TEXT_INPUT/label/dblClick';
  payload: ITextInputLabelDblClick;
};
// export type ITextInputLabelDblClick = t.MouseEvent & { target: 'READ_ONLY' | 'PLACEHOLDER' };
export type ITextInputLabelDblClick = { target: 'READ_ONLY' | 'PLACEHOLDER' };
