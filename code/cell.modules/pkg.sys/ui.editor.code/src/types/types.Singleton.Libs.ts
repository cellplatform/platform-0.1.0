import { t } from './common';

export type ICodeEditorAddedLib = t.IDisposable & { filename: string };

/**
 * API for manipulating external type-definition libraries.
 */
export type ICodeEditorLibs = {
  readonly list: ICodeEditorAddedLib[];

  add(filename: string, content: string): ICodeEditorAddedLib;
  loadDefs(urlOrFolder: string): Promise<ICodeEditorAddedLib[]>;
  clear(): void;
};
