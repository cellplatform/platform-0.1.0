import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { slug, t, Translate } from '../common';
import { Listeners, Bubble } from './Monaco.EditorInstance.events';
import { EditorEvents } from '../event';

export type CodeEditorInstanceArgs = {
  singleton: t.IMonacoSingleton;
  instance: t.IMonacoStandaloneCodeEditor;
  id?: string;
  filename?: string;
  bus?: t.CodeEditorEventBus;
};

// Types per file
//    https://stackoverflow.com/questions/43058191/how-to-use-addextralib-in-monaco-with-an-external-type-definition

// Multi-cursor
//    https://github.com/Microsoft/monaco-editor/issues/366

/**
 * API helpers for manipulating an [IMonacoStandaloneCodeEditor] instance.
 *
 * Refs:
 *    https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonecodeeditor.html
 *
 */
export const CodeEditorInstance = (args: CodeEditorInstanceArgs): t.CodeEditorInstance => {
  const { instance, singleton } = args;
  const id = args.id || slug();

  const dispose$ = new Subject<void>();
  const event$ = new Subject<t.MonacoEvent>();
  const listeners = Listeners({ event$, editor: instance, instance: id });

  Bubble(event$, event$ as t.Subject<t.CodeEditorEvent>);

  const events = EditorEvents(event$);

  events.editor$.subscribe((e) => {
    console.group('🌳 ');

    console.log('e', e);
    console.log('api.position', api.position);

    // const f = instance.getSelection()
    console.log('instance.getSelection()', instance.getSelection());
    console.log('instance.getSelections()', instance.getSelections());
    console.groupEnd();
  });

  // TEMP 🐷

  const filename = args.filename ? args.filename?.replace(/^\/*/, '') : 'default.ts';
  const uri = singleton.monaco.Uri.parse(`file:///${args.filename?.replace(/^\/*/, '')}`);
  // console.log('uri.toString()', uri.toString());

  let code = `// ${args.filename}\nconst a:number[] = [1,2,3]\n`;
  code += `import {add} from 'math';\nconst x = add(3, 5);\n`;
  code += `const total = a.reduce((acc, next) =>acc + next, 0);\n`;

  // TEMP 🐷
  if (filename === 'one.ts') {
    // console.group('🌳 one.ts');

    const def = 'export declare function add(a: number, b: number): number';
    singleton.libs.add('node_modules/@types/math/index.d.ts', def);

    // console.groupEnd();
  }

  const model = singleton.monaco.editor.createModel(code, 'typescript', uri);
  instance.setModel(model);

  const api = {
    id,
    instance,
    event$: event$.pipe(takeUntil(dispose$), share()),
    dispose$: dispose$.pipe(share()),

    /**
     * Assign focus to the editor.
     */
    focus() {
      instance.focus();
    },

    /**
     * Get/set the value of the code editor.
     */
    get value() {
      return instance.getValue();
    },
    set value(value: string) {
      instance.setValue(value);
    },

    /**
     * Gets the cursor position.
     */
    get position() {
      return Translate.position.toCodeEditor(instance.getPosition());
    },
    set(value: t.CodeEditorPosition) {
      instance.setPosition(Translate.position.toMonaco(value));
    },

    /**
     * Destroy all handlers.
     */
    dispose() {
      listeners.dispose();
      dispose$.next();
      dispose$.complete();
      event$.complete();
    },
  };

  // Bubble events.
  if (args.bus) {
    api.event$.subscribe((e) => args.bus?.fire(e));
  }

  return api;
};
