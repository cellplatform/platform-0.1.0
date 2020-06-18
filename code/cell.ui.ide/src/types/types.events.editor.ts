import { t } from './common';

export type EditorEvent = IIdeEditorContentChangeEvent;

/**
 * [Events]
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
};
