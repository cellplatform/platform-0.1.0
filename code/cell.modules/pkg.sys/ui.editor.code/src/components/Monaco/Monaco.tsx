import { monaco } from '@monaco-editor/react';

import { t } from '../../common';
import { registerPrettier } from '../Monaco.config/configure.prettier';
import { theme } from '../Monaco.config/configure.theme';
import { MonacoSingleton } from './Monaco.singleton';

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

    singleton = new Promise<t.IMonacoSingleton>(async (resolve, reject) => {
      console.log('monaco', monaco);

      try {
        const api = (await monaco.init()) as t.IMonaco;
        // m.
        // configure.theme(m)
        console.log('theme', theme);

        // Run configuration routines.
        theme(api);
        registerPrettier(api);

        // Finish up.
        resolve(MonacoSingleton.create(api));
      } catch (error) {
        reject(error);
      }
    });

    return singleton;
  },
};
