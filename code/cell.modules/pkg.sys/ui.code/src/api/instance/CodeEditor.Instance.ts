import { Monaco } from '../../api';
import { slug, t, DEFAULT } from '../../common';
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
    language?: t.CodeEditorLanguage;
  }): t.CodeEditorInstance {
    const { instance, singleton, bus } = args;
    const id = args.id || `editor-${slug()}`;
    const listeners = MonacoListeners({ bus, instance, id });
    const events = InstanceEvents({ bus, id });

    // TEMP 🐷

    const filename = args.filename ? args.filename?.replace(/^\/*/, '') : 'default.ts';
    const uri = singleton.monaco.Uri.parse(`file:///${args.filename?.replace(/^\/*/, '')}`);

    // TEMP 🐷
    if (filename === 'one.ts') {
      // console.group('🌳 one.ts');

      const def = 'export declare function add(a: number, b: number): number';
      singleton.libs.add('node_modules/@types/math/index.d.ts', def);

      // console.groupEnd();
    }

    let language: t.CodeEditorLanguage = args.language ?? DEFAULT.MODEL.language;
    const model = singleton.monaco.editor.createModel(DEFAULT.MODEL.text, language, uri);
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
       * The value of the code editor.
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
       * Editor language.
       */
      get language() {
        return language;
      },
      set language(value: t.CodeEditorLanguage) {
        if (value !== language) {
          const editor = singleton.monaco.editor;
          editor.setModelLanguage(instance.getModel(), value);
          language = value;
        }
      },

      /**
       * The current selection state.
       */
      get selection() {
        return Monaco.getSelection(instance);
      },

      /**
       * Change selection.
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
