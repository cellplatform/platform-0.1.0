import { t } from './common';

export type CodeEditorEvent = t.MonacoEvent | ICodeEditorFocusEvent;

/**
 * Fired when editor reieves of loses focus.
 */
export type ICodeEditorFocusEvent = {
  type: 'CodeEditor/focus';
  payload: ICodeEditorFocus;
};
export type ICodeEditorFocus = {
  instance: string;
  isFocused: boolean;
};
