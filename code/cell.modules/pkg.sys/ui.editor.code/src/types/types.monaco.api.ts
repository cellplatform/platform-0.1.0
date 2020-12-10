import { IMonaco } from '../types.monaco';
import { IDisposable } from '../common/types';

export type IMonacoAddedLib = IDisposable & { filename: string };

/**
 * The singleton instance of the Monaco API.
 */
export type IMonacoSingleton = {
  readonly monaco: IMonaco;
  readonly libs: IMonacoAddedLib[];
  readonly lib: {
    add(filename: string, content: string): IMonacoAddedLib;
    loadDefs(urlOrFolder: string): Promise<IMonacoAddedLib[]>;
    clear(): void;
  };
};
