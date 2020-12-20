import { t } from './common';

export type CodeEditorEvent = ICodeEditorFocusChangeEvent | ICodeEditorSelectionChangeEvent;

/**
 * Fired when editor recieves of loses focus.
 */
export type ICodeEditorFocusChangeEvent = {
  type: 'CodeEditor/focus';
  payload: ICodeEditorFocusChange;
};
export type ICodeEditorFocusChange = {
  instance: string;
  isFocused: boolean;
};

/**
 * Fired when editor cursor/selection changes.
 */
export type ICodeEditorSelectionChangeEvent = {
  type: 'CodeEditor/changed:selection';
  payload: ICodeEditorSelectionChange;
};
export type ICodeEditorSelectionChange = {
  instance: string;
  selection: t.CodeEditorSelection;
  via: 'keyboard' | 'mouse';
};
