import { loader } from '@monaco-editor/react';

import { CodeEditorSingleton } from './CodeEditor.Singleton';
import { t, rx } from '../common';
import { Configure } from '../Configure';
import { staticPaths } from '../Configure/Configure.paths';
import { CodeEditorEvents } from '../Events';

let _singleton: Promise<t.ICodeEditorSingleton>;

/**
 * The singleton instance of monaco-editor logical controller (API).
 */
export function singleton(args: { bus: t.EventBus<any> }) {
  if (_singleton) return _singleton;

  return (_singleton = new Promise<t.ICodeEditorSingleton>(async (resolve, reject) => {
    try {
      const { bus } = args;
      const events = CodeEditorEvents(bus);
      const status = await events.status.get();
      const paths = status?.paths ?? staticPaths();

      if (!status || !status.initialized) {
        const busid = rx.bus.instance(bus);
        const msg = `CodeEditor controller for event-bus "${busid}" not ready. Ensure [CodeEditor.start()] has been called.`;
        throw new Error(msg);
      }

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
}
