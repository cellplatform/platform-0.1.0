import { loader } from '@monaco-editor/react';

import { configure } from './config';
import { t } from '../common';
import { CodeEditorSingleton } from './singleton';
import { Events } from './event';

let singleton: Promise<t.ICodeEditorSingleton>;

/**
 * Static entry points.
 */
export const CodeEditor = {
  /**
   * The singleton instance of monaco-editor logical controller (API).
   */
  singleton(bus: t.EventBus<any>) {
    if (singleton) {
      return singleton;
    }

    return (singleton = new Promise<t.ICodeEditorSingleton>(async (resolve, reject) => {
      try {
        // Initialize.
        const monaco = await loader.init();
        const api = CodeEditorSingleton.create(bus, monaco as unknown as t.IMonaco);

        // Run configuration routines.
        await Promise.all([
          configure.defineThemes(api),
          configure.registerLanguage(api),
          configure.registerPrettier(api),
        ]);

        // Finish up.
        resolve(api);
      } catch (error: any) {
        reject(error);
      }
    }));
  },

  /**
   * Create a generic event API.
   */
  events(bus: t.EventBus<any>) {
    return Events.create(bus);
  },
};
