import { t } from './common';

export type MonacoEvent =
  | ICodeEditorMonacoContentChangedEvent
  | ICodeEditorMonacoCursorPositionChangedEvent
  | ICodeEditorMonacoCursorSelectionChangedEvent;

/**
 * Fired when the code editor content has changed.
 */
export type ICodeEditorMonacoContentChangedEvent = {
  type: 'Monaco/changed:content';
  payload: ICodeEditorMonacoContentChanged;
};
export type ICodeEditorMonacoContentChanged = t.IMonacoModelContentChangedEvent & {
  instance: string;
};

/**
 * Fired when the code editor's cursor position changes.
 */
export type ICodeEditorMonacoCursorPositionChangedEvent = {
  type: 'Monaco/changed:cursorPosition';
  payload: ICodeEditorMonacoCursorPositionChanged;
};
export type ICodeEditorMonacoCursorPositionChanged = t.IMonacoCursorPositionChangedEvent & {
  instance: string;
};

/**
 * Fired when the code editor's cursor selection changes.
 */
export type ICodeEditorMonacoCursorSelectionChangedEvent = {
  type: 'Monaco/changed:cursorSelection';
  payload: ICodeEditorMonacoCursorSelectionChanged;
};
export type ICodeEditorMonacoCursorSelectionChanged = t.IMonacoCursorSelectionChangedEvent & {
  instance: string;
};
