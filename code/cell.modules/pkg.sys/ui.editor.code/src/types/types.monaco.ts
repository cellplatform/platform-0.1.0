import { IMonaco } from '../types.monaco';
import { t } from './common';

export type IMonacoAddedLib = t.IDisposable & { filename: string };

/**
 * The singleton instance of the Monaco API.
 */
export type IMonacoSingleton = {
  readonly monaco: IMonaco;
  readonly libs: IMonacoSingletonLibs;
};

/**
 * API for manipulating external type-definition libraries.
 */
export type IMonacoSingletonLibs = {
  readonly list: IMonacoAddedLib[];
  add(filename: string, content: string): IMonacoAddedLib;
  loadDefs(urlOrFolder: string): Promise<IMonacoAddedLib[]>;
  clear(): void;
};