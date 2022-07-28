import { IMonaco } from '../types.monaco';
import { t } from './common';

/**
 * The singleton instance of the Monaco API.
 */
export type ICodeEditorSingleton = {
  readonly monaco: IMonaco;
  readonly libs: t.ICodeEditorLibs;
};

/**
 * Status information about the CodeEditor (and the environment).
 */
export type CodeEditorStatus = {
  ready: boolean;
  paths: t.CodeEditorStaticPaths;
};

export type CodeEditorStaticPaths = {
  vs: string;
  types: { es: string; sys: string };
};
