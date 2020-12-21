import { t } from './common';
import { MonacoPushEditOperations } from './monaco.TextModel.editOperation';

type D = t.IDisposable;

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodel.html
 */
export type IMonacoTextModel = {
  // Properties.
  id: string;

  // Methods.
  getValue(eol?: t.IMonacoEndOfLinePreference, preserveBOM?: boolean): string;
  getFullModelRange(): t.IMonacoRange;
  getLinesContent(): string[];
  pushEditOperations: MonacoPushEditOperations;

  // Events.
  onDidChangeContent(listener: (e: t.IMonacoModelContentChangedEvent) => void): D;
};
