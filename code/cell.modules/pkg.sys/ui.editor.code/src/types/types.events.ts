import { t } from './common';

export type CodeEditorEvent = t.MonacoEvent | CodeEditorComponentEvent;
export type CodeEditorComponentEvent = ICodeEditorFocusChangeEvent;

/**
 * Fired when editor reieves of loses focus.
 */
export type ICodeEditorFocusChangeEvent = {
  type: 'CodeEditor/changed:focus';
  payload: ICodeEditorFocusChange;
};
export type ICodeEditorFocusChange = {
  instance: string;
  isFocused: boolean;
};
