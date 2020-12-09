import { t } from '../../common';
import { configure } from '../Monaco.config';

/**
 * Singleton instance of an initialized Monaco Editor.
 * This is used to programatically manipulate the editor(s).
 *
 *    https://microsoft.github.io/monaco-editor/api/index.html
 *
 */
export const MonacoSingleton = {
  create(monaco: t.IMonaco): t.IMonacoSingleton {
    let libs: t.IMonacoAddedLib[] = [];

    /**
     * API for adding and removing type definition libraries to the editor.
     */
    const lib: t.IMonacoSingleton['lib'] = {
      /**
       * Adds a type-definition library to the editor.
       */
      add: (filename: string, content: string) => {
        filename = configure.formatFilename(filename);
        const ts = monaco.languages.typescript.typescriptDefaults;
        const ref = ts.addExtraLib(content, filename);
        libs = [...api.libs, { filename, ref }];
        return ref;
      },

      /**
       * Removes all type-definition libraries from the editor.
       */
      clear: () => {
        libs.forEach(({ ref }) => ref.dispose());
        libs = [];
      },
    };

    const api: t.IMonacoSingleton = {
      monaco,
      lib,
      get libs() {
        return libs;
      },
    };

    return api;
  },
};
