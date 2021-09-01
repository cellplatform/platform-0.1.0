import { Monaco } from '../../api';
import { slug, t } from '../../common';
import { CodeEditorAction } from './CodeEditor.Action';
import { InstanceEvents } from '../event';
import { InstanceController } from './CodeEditor.Instance.Controller';
import { MonacoListeners } from './CodeEditor.Instance.monacoListeners';
import { select } from './CodeEditor.Instance.select';

/**
 * API helpers for manipulating an [IMonacoStandaloneCodeEditor] instance.
 *
 * Refs:
 *    https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonecodeeditor.html
 *
 */
export const CodeEditorInstance = {
  /**
   * Create a new editor instance API.
   */
  create(args: {
    bus: t.CodeEditorEventBus;
    singleton: t.ICodeEditorSingleton;
    instance: t.IMonacoStandaloneCodeEditor;
    id?: string;
    filename?: string;
  }): t.CodeEditorInstance {
    const { instance, singleton, bus } = args;
    const id = args.id || `editor-${slug()}`;
    const listeners = MonacoListeners({ bus, instance, id });
    const events = InstanceEvents({ bus, id });

    // TEMP 🐷

    const filename = args.filename ? args.filename?.replace(/^\/*/, '') : 'default.ts';
    const uri = singleton.monaco.Uri.parse(`file:///${args.filename?.replace(/^\/*/, '')}`);
    // console.log('uri.toString()', uri.toString());

    const code = `
// ${args.filename}
const a:number[] = [1,2,3]
import {add} from 'math'
const x = add(3, 5)
const total = a.reduce((acc, next) =>acc + next, 0)
          `;

    // TEMP 🐷
    if (filename === 'one.ts') {
      // console.group('🌳 one.ts');

      const def = 'export declare function add(a: number, b: number): number';
      singleton.libs.add('node_modules/@types/math/index.d.ts', def);

      // console.groupEnd();
    }

    const model = singleton.monaco.editor.createModel(code, 'typescript', uri);
    instance.setModel(model);

    const editor: t.CodeEditorInstance = {
      id,
      instance,
      singleton,
      events,

      /**
       * Assign focus to the editor.
       */
      focus() {
        instance.focus();
      },

      /**
       * Get/set the value of the code editor.
       */
      get text() {
        return instance.getValue();
      },
      set text(value: string) {
        // NB: Done via push-edit operation to preserve the undo stack.
        model.pushEditOperations(
          [],
          [
            {
              range: model.getFullModelRange(),
              text: value,
            },
          ],
        );
      },

      /**
       * Get the current selection state.
       */
      get selection() {
        return Monaco.getSelection(instance);
      },

      /**
       * Chance selection.
       */
      select(input: t.CodeEditorSelection | null) {
        select({ instance, input });
      },

      /**
       * Retrieve the specified code-editor action.
       */
      action(id) {
        return CodeEditorAction(instance, id);
      },

      /**
       * Editor destroyed.
       */
      dispose() {
        listeners.dispose();
        events.dispose();
      },
    };

    InstanceController(bus, editor);
    return editor;
  },
};
