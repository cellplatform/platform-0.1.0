import { Schema, Node } from 'prosemirror-model';
import { Transaction, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export { Transaction, EditorState, Schema, EditorView, Node };

export type IEditorSize = { width: number; height: number };

/**
 * See: `plugins/keyMap.ts`
 */
export type EditorKeyMap = { [key: string]: boolean | string };

export type ITextEditorModifierKeys = {
  alt: boolean;
  control: boolean;
  shift: boolean;
  meta: boolean;
};

/**
 * [Events]
 */
export type TextEditorEvent = ITextEditorChangingEvent | ITextEditorChangedEvent;

export type ITextEditorChangingEvent<S extends Schema = any> = {
  type: 'EDITOR/changing';
  payload: ITextEditorChanging<S>;
};
export type ITextEditorChanging<S extends Schema = any> = {
  transaction: Transaction<S>;
  state: { from: EditorState<S>; to: EditorState<S> };
  value: { from: string; to: string };
  size: { from: IEditorSize; to: IEditorSize };
  modifierKeys: ITextEditorModifierKeys;
  isCancelled: boolean;
  cancel(): void;
};

export type ITextEditorChangedEvent<S extends Schema = any> = {
  type: 'EDITOR/changed';
  payload: ITextEditorChanged<S>;
};
export type ITextEditorChanged<S extends Schema = any> = {
  state: { from?: EditorState<S>; to: EditorState<S> };
  value: { from: string; to: string };
  size: { from: IEditorSize; to: IEditorSize };
  modifierKeys: ITextEditorModifierKeys;
};
