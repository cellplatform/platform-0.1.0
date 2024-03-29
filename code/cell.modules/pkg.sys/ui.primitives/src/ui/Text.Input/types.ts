import * as t from '../../common/types';

type Id = string;
type Milliseconds = number;
type Pixels = number;

export type TextInputInstance = { bus: t.EventBus<any>; id: Id };
export type TextInputCursorAction = 'Cursor:Start' | 'Cursor:End';

export type TextInputStatus = {
  instance: { bus: Id; id: Id };
  focused: boolean;
  empty: boolean;
  value: string;
  size: { width: Pixels; height: Pixels };
  selection: { start: number; end: number };
};

/**
 * Component
 */
export type TextInputValue = {
  value?: string;
  hint?: string | JSX.Element;
  maxLength?: number;
  mask?: t.TextInputMaskHandler;
};

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
export type TextInputFocusAction = {
  focusOnLoad?: boolean;
  focusAction?: 'Select' | TextInputCursorAction;
};

export type TextInputMask = { text: string; char: string };
export type TextInputMaskHandler = (e: TextInputMask) => boolean; // True - OK, False - disallow.

/**
 * EVENTS (API)
 */
type E = TextInputEvents;
export type TextInputEventsDisposable = t.Disposable & E & { clone(): E };
export type TextInputEvents = {
  instance: { bus: Id; id: Id };
  $: t.Observable<t.TextInputEvent>;
  dispose$: t.Observable<void>;

  status: {
    req$: t.Observable<t.TextInputStatusReq>;
    res$: t.Observable<t.TextInputStatusRes>;
    get(options?: { timeout?: Milliseconds }): Promise<TextInputStatusRes>;
  };

  text: {
    changing$: t.Observable<TextInputChanging>;
    changed$: t.Observable<TextInputChanged>;
  };

  focus: {
    $: t.Observable<TextInputFocus>;
    fire(focus?: boolean): void;
  };

  select: {
    $: t.Observable<TextInputSelect>;
    fire(): void;
  };

  cursor: {
    $: t.Observable<TextInputCursor>;
    fire(action: TextInputCursorAction): void;
    start(): void;
    end(): void;
  };

  mouse: { labelDoubleClicked$: t.Observable<TextInputLabelDoubleClicked> };
};

/**
 * EVENT (Callback Definitions)
 */
export type TextInputChangeEventHandler = (e: TextInputChangeEvent) => void;

export type TextInputTabEvent = {
  instance: Id;
  modifierKeys: t.KeyboardModifierFlags;
  isCancelled: boolean;
  cancel(): void;
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
  | TextInputStatusReqEvent
  | TextInputStatusResEvent
  | TextInputChangingEvent
  | TextInputChangedEvent
  | TextInputKeypressEvent
  | TextInputFocusEvent
  | TextInputLabelDoubleClickedEvent
  | TextInputSelectEvent
  | TextInputCursorEvent;

/**
 * Textbox status
 */
export type TextInputStatusReqEvent = {
  type: 'sys.ui.TextInput/Status:req';
  payload: TextInputStatusReq;
};
export type TextInputStatusReq = { instance: Id; tx: Id };

export type TextInputStatusResEvent = {
  type: 'sys.ui.TextInput/Status:res';
  payload: TextInputStatusRes;
};
export type TextInputStatusRes = {
  instance: Id;
  tx: Id;
  status?: TextInputStatus;
  error?: string;
};

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
  focus: boolean;
};

/**
 * Mouse
 */
export type TextInputLabelDoubleClickedEvent = {
  type: 'sys.ui.TextInput/Label/DoubleClicked';
  payload: TextInputLabelDoubleClicked;
};
export type TextInputLabelDoubleClicked = {
  instance: Id;
  target: 'ReadOnly' | 'Placeholder';
  button: 'Left' | 'Right';
};

/**
 * Selection
 */
export type TextInputSelectEvent = {
  type: 'sys.ui.TextInput/Select';
  payload: TextInputSelect;
};
export type TextInputSelect = { instance: Id };

/**
 * Cursor
 */
export type TextInputCursorEvent = {
  type: 'sys.ui.TextInput/Cursor';
  payload: TextInputCursor;
};
export type TextInputCursor = {
  instance: Id;
  action: TextInputCursorAction;
};
