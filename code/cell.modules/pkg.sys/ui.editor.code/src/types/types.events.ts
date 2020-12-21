import { t } from './common';

export type CodeEditorEvent = CodeEditorChangeEvent | CodeEditorChangedEvent;

// Events that change the state of the editor.
export type CodeEditorChangeEvent = ICodeEditorChangeFocusEvent | ICodeEditorChangeSelectionEvent;

// Events that report changes to the state of the editor.
export type CodeEditorChangedEvent =
  | ICodeEditorSelectionChangedEvent
  | ICodeEditorFocusChangedEvent;

/**
 * Fired when editor recieves of loses focus.
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
 * Fires to cause a change to the editor selection.
 */
export type ICodeEditorChangeSelectionEvent = {
  type: 'CodeEditor/change:selection';
  payload: ICodeEditorChangeSelection;
};
export type ICodeEditorChangeSelection = {
  instance: string;
  selection: t.CodeEditorPosition | t.CodeEditorRange | t.CodeEditorRange[];
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
