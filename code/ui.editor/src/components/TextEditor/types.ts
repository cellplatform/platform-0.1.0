import { Schema } from 'prosemirror-model';
import { Transaction, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export { Transaction, EditorState, Schema, EditorView };

/**
 * [Events]
 */
export type TextEditorEvent = ITextEditorChangingEvent | ITextEditorChangedEvent;

export type ITextEditorChangingEvent<S extends Schema = any> = {
  type: 'EDITOR/changing';
  payload: ITextEditorChanging<S>;
};
export type ITextEditorChanging<S extends Schema = any> = ITextEditorChanged<S> & {
  transaction: Transaction<S>;
  cancel(): void;
  isCancelled: boolean;
};

export type ITextEditorChangedEvent<S extends Schema = any> = {
  type: 'EDITOR/changed';
  payload: ITextEditorChanged<S>;
};
export type ITextEditorChanged<S extends Schema = any> = {
  state: EditorState<S>;
  view: EditorView<S>;
  markdown: string;
  size: { width: number; height: number };
};
