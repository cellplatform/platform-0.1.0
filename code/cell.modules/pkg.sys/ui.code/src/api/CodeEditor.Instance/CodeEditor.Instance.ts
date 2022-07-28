import { Monaco } from '..';
import { slug, t, DEFAULT, rx } from '../common';
import { CodeEditorAction } from './CodeEditor.Action';
import { CodeEditorInstanceEvents, CodeEditorEvents } from '../Events';
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
export function CodeEditorInstance(args: {
  instance: { bus: t.EventBus<any>; id?: string };
  monaco: {
    singleton: t.ICodeEditorSingleton;
    instance: t.IMonacoStandaloneCodeEditor;
  };
  filename?: string;
  language?: t.CodeEditorLanguage;
}) {
  const { monaco } = args;
  const { instance, singleton } = args.monaco;
  const bus = rx.bus<t.CodeEditorEvent>(args.instance.bus);
  const id = args.instance?.id || `editor-${slug()}`;

  const listeners = MonacoListeners({ instance: { bus, id }, editor: monaco.instance });
  const events = CodeEditorInstanceEvents({ bus, id });

  const { dispose$ } = events;
  const global = CodeEditorEvents(bus, { dispose$ });

  let _isDisposed = false;
  dispose$.subscribe(() => (_isDisposed = true));

  /**
   * TODO 🐷
   * - construct URI from derived filename?
   *   Look this up in docs to understand usage scope more.
   * - Drop the idea of an instance-id AND a filename, possibly just ONE unique identifier (???)
   */

  const filename = args.filename ? args.filename?.replace(/^\/*/, '') : 'default.ts';
  const uri = singleton.monaco.Uri.parse(`file:///${filename.replace(/^\/*/, '')}`);

  /**
   * TODO 🐷 TEMP
   * Set this up globally via API ??
   */
  if (filename === 'one.ts') {
    const def = 'export declare function add(a: number, b: number): number';
    singleton.libs.add('node_modules/@types/math/index.d.ts', def);
  }

  let _language: t.CodeEditorLanguage = args.language ?? DEFAULT.MODEL.language;
  instance.setModel(singleton.monaco.editor.createModel(DEFAULT.MODEL.text, _language, uri));

  const getStatus = (): t.CodeEditorInstanceStatus => {
    return { id, filename };
  };

  const api: t.CodeEditorInstance = {
    id,
    instance,
    singleton,
    events,
    dispose$,

    /**
     * Flag indicating if the instance has been disposed.
     */
    get isDisposed() {
      return _isDisposed;
    },

    /**
     * The value of the code editor.
     */
    get text() {
      return instance.getValue();
    },
    set text(value: string) {
      // NB: Done via push-edit operation to preserve the undo stack.
      const model = instance.getModel();
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
      return _language;
    },
    set language(value: t.CodeEditorLanguage) {
      if (value !== _language) {
        const editor = singleton.monaco.editor;
        const model = instance.getModel();
        editor.setModelLanguage(model, value);
        _language = value;
      }
    },

    /**
     * The current selection state.
     */
    get selection() {
      return Monaco.getSelection(instance);
    },

    /**
     * Assign focus to the editor.
     */
    focus() {
      instance.focus();
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

      global.status.instance.fire({
        instance: id,
        action: 'Lifecycle:End',
        info: getStatus(),
      });
    },
  };

  InstanceController(bus, api);

  global.status.instance.fire({
    instance: id,
    action: 'Lifecycle:Start',
    info: getStatus(),
  });

  return api;
}
