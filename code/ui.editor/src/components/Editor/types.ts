import { Schema } from 'prosemirror-model';
import { Transaction, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export { Transaction };

/**
 * [Events]
 */
export type EditorEvent = IEditorTransactionEvent;

export type IEditorTransactionEvent<S extends Schema = any> = {
  type: 'EDITOR/transaction';
  payload: {
    stage: 'BEFORE' | 'AFTER';
    transaction: Transaction<S>;
    state: EditorState<S>;
    view: EditorView<S>;
  };
};
