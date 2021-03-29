import { t } from './common';

export type IIdeEditorPosition = { lineNumber: number; column: number };

/**
 * [Events]
 */
export type EditorEvent = IIdeEditorContentChangeEvent;

/**
 * Fired after content has changed within the code-editor.
 */
export type IIdeEditorContentChangeEvent = {
  type: 'APP:IDE/editor/contentChange';
  payload: IIdeEditorContentChange;
};
export type IIdeEditorContentChange = {
  text: string;
  eol: string;
  isFlush: boolean;
  isRedoing: boolean;
  isUndoing: boolean;
  versionId: number;
  change: t.IIdeModelChange;
  position: t.IIdeEditorPosition;
};
