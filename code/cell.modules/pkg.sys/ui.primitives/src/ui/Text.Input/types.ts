import { Subject } from 'rxjs';

import * as t from '../../common/types';

type Id = string;

export type TextInputInstance = { bus: t.EventBus<any>; id: Id };

/**
 * Component
 */
export type TextInputProps = t.TextInputFocusAction &
  t.TextInputEventHandlers &
  TextInputValue & {
    instance?: TextInputInstance;
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

/**
 * Input
 */
export type TextInputValue = {
  value?: string;
  maxLength?: number;
  mask?: t.TextInputMaskHandler;
};

export type TextInputFocusAction = {
  selectOnFocus?: boolean;
  focusOnLoad?: boolean;
  focusAction?: 'Select' | 'To:End';
};

export type TextInputMask = { text: string; char: string };
export type TextInputMaskHandler = (e: TextInputMask) => boolean; // True - OK, False - disallow.

/**
 * EVENTS (API)
 */
type E = TextInputEvents;
export type TextInputEventsDisposable = t.Disposable & E & { clone(): E };
export type TextInputEvents = {
  readonly instance: { bus: Id; id: Id };
  readonly $: t.Observable<t.TextInputEvent>;
  readonly dispose$: t.Observable<void>;
  readonly text: {
    readonly changing$: t.Observable<TextInputChanging>;
    readonly changed$: t.Observable<TextInputChanged>;
  };
};

/**
 * EVENT (Callback Definitions)
 */
export type TextInputChangeEventHandler = (e: TextInputChangeEvent) => void;

export type TextInputTabEvent = {
  instance: Id;
  isCancelled: boolean;
  cancel(): void;
  modifierKeys: t.KeyboardModifierFlags;
};
export type TextInputTabEventHandler = (e: TextInputTabEvent) => void;

export type TextInputKeyEvent = React.KeyboardEvent<HTMLInputElement> & {
  instance: Id;
  modifierKeys: t.KeyboardModifierFlags;
};
export type TextInputKeyEventHandler = (e: TextInputKeyEvent) => void;

export type TextInputEventHandlers = {
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
 * EVENT (Definitions)
 */
export type TextInputEvent =
  | TextInputChangingEvent
  | TextInputChangedEvent
  | TextInputKeypressEvent
  | TextInputFocusEvent
  | TextInputLabelDblClickEvent;

/**
 * Change.
 */
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

export type TextInputChangeEvent = {
  instance: Id;
  from: string;
  to: string;
  char: string;
  isMax: boolean | null;
  modifierKeys: t.KeyboardModifierFlags;
};

/**
 * Keypress
 */
export type TextInputKeypressEvent = {
  type: 'sys.ui.TextInput/Keypress';
  payload: TextInputKeypress;
};
export type TextInputKeypress = {
  instance: Id;
  pressed: boolean;
  key: TextInputKeyEvent['key'];
  event: TextInputKeyEvent;
};

/**
 * Focus
 */
export type TextInputFocusEvent = {
  type: 'sys.ui.TextInput/Focus';
  payload: TextInputFocus;
};
export type TextInputFocus = {
  instance: Id;
  isFocused: boolean;
};

/**
 * Mouse
 */
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
