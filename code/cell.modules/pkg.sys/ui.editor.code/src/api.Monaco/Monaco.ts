import { monaco as MonacoEditor } from '@monaco-editor/react';

import { t, Translate, R } from '../common';
import { configure } from './config';
import { MonacoSingleton } from './Monaco.Singleton';

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
   * Derive the current selection object.
   */
  selection(instance: t.IMonacoStandaloneCodeEditor): t.CodeEditorSelection {
    const toRange = (input: t.IMonacoSelection): t.CodeEditorRange => {
      return {
        start: { line: input.startLineNumber, column: input.startColumn },
        end: { line: input.endLineNumber, column: input.endColumn },
      };
    };

    const primary = toRange(instance.getSelection());
    const secondary = instance
      .getSelections()
      .map((s) => toRange(s))
      .filter((r) => !R.equals(r, primary));

    return {
      cursor: Translate.position.toCodeEditor(instance.getPosition()),
      primary,
      secondary,
    };
  },
};
