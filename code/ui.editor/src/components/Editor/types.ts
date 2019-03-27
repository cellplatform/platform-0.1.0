import { Schema } from 'prosemirror-model';
import { Transaction, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export { Transaction, EditorState, Schema, EditorView };

/**
 * [Events]
 */
export type EditorEvent = IEditorChangingEvent | IEditorChangedEvent;

export type IEditorChangingEvent<S extends Schema = any> = {
  type: 'EDITOR/changing';
  payload: IEditorChanging<S>;
};
export type IEditorChanging<S extends Schema = any> = IEditorChanged<S> & {
  cancel(): void;
  isCancelled: boolean;
};

export type IEditorChangedEvent<S extends Schema = any> = {
  type: 'EDITOR/changed';
  payload: IEditorChanged<S>;
};
export type IEditorChanged<S extends Schema = any> = {
  transaction: Transaction<S>;
  state: EditorState<S>;
  view: EditorView<S>;
  content: string;
};
