import { monaco } from '@monaco-editor/react';

import { t } from '../../common';
import { configure } from '../Monaco.config';
import { MonacoSingleton } from './api.Monaco.singleton';

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
        // Initialize
        const api = MonacoSingleton.create((await monaco.init()) as t.IMonaco);

        // Run configuration routines.
        await Promise.all([
          configure.theme(api),
          configure.language(api),
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
