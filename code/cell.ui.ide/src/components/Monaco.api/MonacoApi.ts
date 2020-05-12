import { t } from '../../common';

import { configure } from '../Monaco.configure';
import { monaco } from '@monaco-editor/react';

export type IArgs = { monaco: t.IMonaco };
export type IAddedLib = { filename: string; ref: t.IDisposable };

/**
 * API wrapper for Monaco.
 * https://microsoft.github.io/monaco-editor/api/index.html
 */
export class MonacoApi {
  public static create = (args: IArgs) => new MonacoApi(args);

  public static async singleton() {
    return (
      this._singleton ||
      (this._singleton = new Promise<MonacoApi>(async (resolve, reject) => {
        monaco
          .init()
          .then((monaco: t.IMonaco) => {
            configure.theme(monaco);
            configure.language(monaco);
            configure.registerPrettier(monaco);
            resolve(MonacoApi.create({ monaco }));
          })
          .catch((err) => reject(err));
      }))
    );
  }

  /**
   * [Lifecycle]
   */

  private constructor(args: IArgs) {
    this.monaco = args.monaco;
  }

  /**
   * [Fields]
   */

  private static _singleton: Promise<MonacoApi>;
  private readonly monaco: t.IMonaco;
  public libs: IAddedLib[] = [];

  /**
   * [Properties]
   */

  public get lib() {
    return {
      add: (filename: string, content: string) => {
        filename = configure.formatFilename(filename);
        const typescriptDefaults = this.monaco.languages.typescript.typescriptDefaults;
        const ref = typescriptDefaults.addExtraLib(content, filename);
        this.libs = [...this.libs, { filename, ref }];
        return ref;
      },

      clear: () => {
        this.libs.forEach(({ ref }) => ref.dispose());
        this.libs = [];
      },
    };
  }
}
