import { t } from './common';

export type ICodeEditorAddedLib = t.IDisposable & { filename: string };

/**
 * API for manipulating external type-definition libraries.
 */
export type ICodeEditorLibs = {
  readonly list: ICodeEditorAddedLib[];
  clear(): void;
  add(filename: string, content: string): ICodeEditorAddedLib;
  fromNetwork(url: string): Promise<ICodeEditorAddedLib[]>;
};
