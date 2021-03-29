import { t } from './common';

export type MonacoRegisterDocumentFormattingEditProvider = (
  languageId: string,
  provider: t.IMonacoDocumentFormattingEditProvider,
) => t.IDisposable;

type Result = { range: t.IMonacoRange; text: string };

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.documentformattingeditprovider.html#providedocumentformattingedits
 */
export type IMonacoDocumentFormattingEditProvider = {
  displayName?: string;
  provideDocumentFormattingEdits(
    model: t.IMonacoTextModel,
    options: IMonacoFormattingOptions,
    token: t.IMonacoCancellationToken,
  ): Promise<Result[]>;
};

/**
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.formattingoptions.html
 */
export type IMonacoFormattingOptions = {
  insertSpaces: boolean;
  tabSize: number;
};
