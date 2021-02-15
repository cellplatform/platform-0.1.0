import { t } from './common';

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
  pushEditOperations: t.MonacoPushEditOperations;

  // Events.
  onDidChangeContent(listener: (e: t.IMonacoModelContentChangedEvent) => void): D;
};
