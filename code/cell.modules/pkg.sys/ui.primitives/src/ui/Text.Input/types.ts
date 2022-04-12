import { Subject } from 'rxjs';

import * as t from '../../common/types';

type Id = string;

export type TextInputInstance = { bus: t.EventBus<any>; id: Id };

/**
 * Component
 */

export type TextInputValue = {
  value?: string;
  maxLength?: number;
  mask?: t.TextInputMaskHandler;
};

export type IHtmlInputProps = t.TextInputFocusAction &
  t.ITextInputEvents &
  TextInputValue & {
    instance: t.TextInputInstance;
    events$: Subject<t.TextInputEvent>;
    className?: string;
    isEnabled?: boolean;
    isPassword?: boolean;
    disabledOpacity?: number;
    style?: t.CssValue;
    valueStyle?: t.TextInputStyle;
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
  TextInputValue & {
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
    valueStyle?: t.TextInputStyle;
    placeholderStyle?: t.TextInputStyle;
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
export type TextInputStyle = t.TextStyle & { disabledColor?: number | string };

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

export type TextInputFocusAction = {
  selectOnFocus?: boolean;
  focusOnLoad?: boolean;
  focusAction?: 'Select' | 'To:End';
};

export type ITextInputMask = { text: string; char: string };
export type TextInputMaskHandler = (e: ITextInputMask) => boolean; // True - OK, False - disallow.

/**
 * [Events]
 */
export type TextInputChangeEvent = {
  instance: Id;
  from: string;
  to: string;
  char: string;
  isMax: boolean | null;
  modifierKeys: t.KeyboardModifierFlags;
};
export type TextInputChangeEventHandler = (e: TextInputChangeEvent) => void;

export type TextInputTabEvent = {
  isCancelled: boolean;
  cancel(): void;
  modifierKeys: t.KeyboardModifierFlags;
};
export type TextInputTabEventHandler = (e: TextInputTabEvent) => void;

export type TextInputKeyEvent = React.KeyboardEvent<HTMLInputElement> & {
  modifierKeys: t.KeyboardModifierFlags;
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
 * EVENTS (API)
 */
type E = TextInputEvents;
export type TextInputEventsDisposable = t.Disposable & E & { clone(): E };
export type TextInputEvents = {
  readonly instance: { bus: Id; id: Id };
  readonly $: t.Observable<t.TextInputEvent>;
  readonly dispose$: t.Observable<void>;
  readonly changing$: t.Observable<TextInputChanging>;
  readonly changed$: t.Observable<TextInputChanged>;
};

/**
 * EVENT (Definitions)
 */
export type TextInputEvent =
  | TextInputChangingEvent
  | TextInputChangedEvent
  | TextInputKeypressEvent
  | TextInputFocusEvent
  | TextInputLabelDblClickEvent;

export type TextInputChangingEvent = {
  type: 'sys.ui.TextInput/Changing';
  payload: TextInputChanging;
};
export type TextInputChanging = TextInputChangeEvent & {
  instance: Id;
  isCancelled: boolean;
  cancel(): void;
};

export type TextInputChangedEvent = {
  type: 'sys.ui.TextInput/Changed';
  payload: TextInputChanged;
};
export type TextInputChanged = TextInputChangeEvent;

export type TextInputKeypressEvent = {
  type: 'sys.ui.TextInput/Keypress';
  payload: TextInputKeypress;
};
export type TextInputKeypress = {
  instance: Id;
  isPressed: boolean;
  key: TextInputKeyEvent['key'];
  event: TextInputKeyEvent;
};

export type TextInputFocusEvent = {
  type: 'sys.ui.TextInput/Focus';
  payload: TextInputFocus;
};
export type TextInputFocus = {
  instance: Id;
  isFocused: boolean;
};

export type TextInputLabelDblClickEvent = {
  type: 'sys.ui.TextInput/Label/DoubleClick';
  payload: TextInputLabelDblClick;
};
export type TextInputLabelDblClick = {
  instance: Id;
  target: 'READ_ONLY' | 'PLACEHOLDER';
};

// TEMP 🐷
// export type ITextInputLabelDblClick = t.MouseEvent & { target: 'READ_ONLY' | 'PLACEHOLDER' };
