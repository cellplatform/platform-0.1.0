import { monaco as MonacoEditor } from '@monaco-editor/react';

import { t } from '../common';
import { configure } from '../Monaco.config';
import { MonacoSingleton } from './Monaco.Singleton';
import { MonacoEditorInstance, MonacoEditorInstanceArgs } from './Monaco.EditorInstance';

let singleton: Promise<t.IMonacoSingleton>;

/**
 * API wrapper for Monaco.
 *
 *    https://microsoft.github.io/monaco-editor/api/index.html
 *
 */
export const Monaco = {
  /**
   * The singleton instance of monaco-editor logical controller (API).
   */
  singleton() {
    if (singleton) {
      return singleton;
    }

    return (singleton = new Promise<t.IMonacoSingleton>(async (resolve, reject) => {
      try {
        // Initialize.
        const monaco = (await MonacoEditor.init()) as t.IMonaco;
        const api = MonacoSingleton.create(monaco);

        // Run configuration routines.
        await Promise.all([
          configure.defineThemes(api),
          configure.registerLanguage(api),
          configure.registerPrettier(api),
        ]);

        // Finish up.
        resolve(api);
      } catch (error) {
        reject(error);
      }
    }));
  },

  /**
   * Create an editor instance.
   */
  editor(args: MonacoEditorInstanceArgs) {
    return MonacoEditorInstance(args);
  },
};
