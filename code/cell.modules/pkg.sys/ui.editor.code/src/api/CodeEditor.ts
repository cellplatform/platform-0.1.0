import { monaco as MonacoEditor } from '@monaco-editor/react';

import { configure } from './config';
import { t } from '../common';
import { CodeEditorSingleton } from './singleton';

let singleton: Promise<t.ICodeEditorSingleton>;

/**
 * Static entry points.
 *
 *
 */
export const CodeEditor = {
  /**
   * The singleton instance of monaco-editor logical controller (API).
   */
  singleton() {
    if (singleton) {
      return singleton;
    }

    return (singleton = new Promise<t.ICodeEditorSingleton>(async (resolve, reject) => {
      try {
        // Initialize.
        const monaco = (await MonacoEditor.init()) as t.IMonaco;
        const api = CodeEditorSingleton.create(monaco);

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
};
