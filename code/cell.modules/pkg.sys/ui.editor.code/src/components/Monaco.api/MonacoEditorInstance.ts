import { Subject } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

import { slug, t } from '../../common';

export type MonacoEditorInstanceArgs = {
  instance: t.IMonacoStandaloneCodeEditor;
  eid?: string;
  event$?: t.Subject<t.CodeEditorEvent>;
};

/**
 * API helpers for manipulating an [IMonacoStandaloneCodeEditor] instance.
 *
 * Refs:
 *    https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonecodeeditor.html
 *
 */
export const MonacoEditorInstance = (args: MonacoEditorInstanceArgs): t.IMonacoInstance => {
  const { instance } = args;
  const id = args.eid || slug();

  const dispose$ = new Subject<void>();
  const event$ = new Subject<t.MonacoEvent>();
  const fire = (e: t.MonacoEvent) => event$.next(e);

  instance.onDidChangeModelContent((e) => {
    fire({ type: 'Monaco/contentChanged', payload: { instance: id, ...e } });
  });

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
     * Destroy all handlers.
     */
    dispose() {
      dispose$.next();
      dispose$.complete();
      event$.complete();
    },
  };

  // Bubble events.
  if (args.event$) {
    api.event$.subscribe((e) => args.event$?.next(e));
  }

  return api;
};
