import { t } from './common';

export type CodeEditorEvent = t.MonacoEvent | CodeEditorComponentEvent;
export type CodeEditorComponentEvent = ICodeEditorFocusChangeEvent | ICodeEditorCursorChangeEvent;

/**
 * Fired when editor recieves of loses focus.
 */
export type ICodeEditorFocusChangeEvent = {
  type: 'CodeEditor/changed:focus';
  payload: ICodeEditorFocusChange;
};
export type ICodeEditorFocusChange = {
  instance: string;
  isFocused: boolean;
};

/**
 * Fired when editor cursor/selection changes.
 */
export type ICodeEditorCursorChangeEvent = {
  type: 'CodeEditor/changed:cursor';
  payload: ICodeEditorCursorChange;
};
export type ICodeEditorCursorChange = {
  instance: string;
  cursor: {
    primary: t.CodeEditorPosition;
    secondary: t.CodeEditorPosition[]; // NB: When multi-entry-select (CMD+D)
  };
  source: 'keyboard' | 'mouse';
};
