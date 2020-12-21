import { t } from './common';

export type CodeEditorEvent = CodeEditorChangeEvent | CodeEditorChangedEvent;

export type CodeEditorChangeEvent =
  | ICodeEditorChangeFocusEvent
  | ICodeEditorChangeSelectionEvent
  | ICodeEditorChangeTextEvent;

export type CodeEditorChangedEvent =
  | ICodeEditorSelectionChangedEvent
  | ICodeEditorFocusChangedEvent
  | ICodeEditorTextChangedEvent;

/**
 * Fired to assign focus to an editor.
 */
export type ICodeEditorChangeFocusEvent = {
  type: 'CodeEditor/change:focus';
  payload: ICodeEditorChangeFocus;
};
export type ICodeEditorChangeFocus = { instance: string };

/**
 * Fired when editor recieves of loses focus.
 */
export type ICodeEditorFocusChangedEvent = {
  type: 'CodeEditor/changed:focus';
  payload: ICodeEditorFocusChanged;
};
export type ICodeEditorFocusChanged = {
  instance: string;
  isFocused: boolean;
};

/**
 * Fired to cause a change to the editor selection.
 */
export type ICodeEditorChangeSelectionEvent = {
  type: 'CodeEditor/change:selection';
  payload: ICodeEditorChangeSelection;
};
export type ICodeEditorChangeSelection = {
  instance: string;
  selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[] | null;
  focus?: boolean;
};

/**
 * Fired when editor cursor/selection changes.
 */
export type ICodeEditorSelectionChangedEvent = {
  type: 'CodeEditor/changed:selection';
  payload: ICodeEditorSelectionChanged;
};
export type ICodeEditorSelectionChanged = {
  instance: string;
  selection: t.CodeEditorSelection;
  via: 'keyboard' | 'mouse';
};

/**
 * Fired to change the text within an editor.
 */
export type ICodeEditorChangeTextEvent = {
  type: 'CodeEditor/change:text';
  payload: ICodeEditorChangeText;
};
export type ICodeEditorChangeText = {
  instance: string;
  text: string;
};

/**
 * Fires when the editor text changes.
 */
export type ICodeEditorTextChangedEvent = {
  type: 'CodeEditor/changed:text';
  payload: ICodeEditorTextChanged;
};
export type ICodeEditorTextChanged = {
  instance: string;
  changes: ICodeEditorTextChange[];
  isFlush: boolean;
  isRedoing: boolean;
  isUndoing: boolean;
};
export type ICodeEditorTextChange = {
  range: t.CodeEditorRange;
  text: string;
};
