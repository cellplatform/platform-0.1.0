import { loader } from '@monaco-editor/react';

import { CodeEditorSingleton } from './CodeEditor.Singleton';
import { LANGUAGES, t } from './common';
import { Configure } from './Configure';
import { staticPaths } from './Configure/Configure.paths';
import { CodeEditorEvents } from './Events';

let singleton: Promise<t.ICodeEditorSingleton>;

/**
 * Static entry points.
 */
export const CodeEditor = {
  Configure,
  languages: LANGUAGES,

  /**
   * The singleton instance of monaco-editor logical controller (API).
   */
  singleton(args: { bus: t.EventBus<any>; staticRoot?: string }) {
    if (singleton) {
      return singleton;
    }

    return (singleton = new Promise<t.ICodeEditorSingleton>(async (resolve, reject) => {
      try {
        const { bus, staticRoot } = args;
        const paths = staticPaths(args.staticRoot);

        /**
         * Ensure the environment is configured.
         *
         * NOTE:     If any custom configuration parameters need to be expressed
         *           call this function seperately BEFORE the first instantiation of the
         *           of the [CodeEditor.singleton()] method.
         */
        Configure.env({ staticRoot });

        // Initialize editor.
        const editor = await loader.init();
        const monaco = editor as unknown as t.IMonaco;
        const api = CodeEditorSingleton({ bus, monaco });

        // Run configuration routines.
        await Promise.all([
          Configure.defineThemes({ api }),
          Configure.registerLanguage({ api }),
          Configure.registerPrettier({ api }),
        ]);

        // Register language types.
        await api.libs.fromNetwork(paths.types.es);

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
  events(bus: t.EventBus<any>, options?: { dispose?: t.Observable<any> }) {
    return CodeEditorEvents(bus, options);
  },
};
