import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { rx, t, Translate } from '../common';

export function Listeners(args: {
  instance: string; // id.
  event$: Subject<t.MonacoEvent>;
  editor: t.IMonacoStandaloneCodeEditor;
}) {
  const { editor, instance, event$ } = args;

  const fire = (e: t.MonacoEvent) => event$.next(e);
  const fireFocus = (isFocused: boolean, source: t.ICodeEditorMonacoFocusChange['source']) => {
    fire({
      type: 'Monaco/changed:focus',
      payload: { instance, source, isFocused },
    });
  };

  const listeners = {
    contentChanged: editor.onDidChangeModelContent((e) => {
      fire({
        type: 'Monaco/changed:content',
        payload: { instance, ...e },
      });
    }),
    cursorChanged: editor.onDidChangeCursorPosition((e) => {
      fire({
        type: 'Monaco/changed:cursorPosition',
        payload: { instance, ...e },
      });
    }),
    selectionChanged: editor.onDidChangeCursorSelection((e) => {
      fire({
        type: 'Monaco/changed:cursorSelection',
        payload: { instance, ...e },
      });
    }),
    focusEditorText: editor.onDidFocusEditorText(() => fireFocus(true, 'text')),
    focusEditorWidget: editor.onDidFocusEditorWidget(() => fireFocus(true, 'widget')),
    blurEditorText: editor.onDidBlurEditorText(() => fireFocus(false, 'text')),
    blurEditorWidget: editor.onDidBlurEditorWidget(() => fireFocus(false, 'widget')),
  };

  return {
    event$,
    dispose: () => Object.keys(listeners).forEach((key) => listeners[key].dispose()),
  };
}

/**
 * Bubbles and translates Monaco events into CodeEditor events.
 */
export function Bubble(source$: Observable<t.MonacoEvent>, target$: Subject<t.CodeEditorEvent>) {
  const fire = (e: t.CodeEditorComponentEvent) => target$.next(e);

  /**
   * Focus
   */
  rx.payload<t.ICodeEditorMonacoFocusChangeEvent>(source$, 'Monaco/changed:focus')
    .pipe(filter((e) => e.source === 'text'))
    .subscribe((e) => {
      const { instance, isFocused } = e;
      fire({ type: 'CodeEditor/changed:focus', payload: { instance, isFocused } });
    });

  /**
   * Cursor
   */
  rx.payload<t.ICodeEditorMonacoCursorPositionChangedEvent>(
    source$,
    'Monaco/changed:cursorPosition',
  ).subscribe((e) => {
    fire({
      type: 'CodeEditor/changed:cursor',
      payload: {
        instance: e.instance,
        source: e.source as t.ICodeEditorCursorChange['source'],
        cursor: {
          secondary: e.secondaryPositions.map((pos) => Translate.position.toCodeEditor(pos)),
          primary: Translate.position.toCodeEditor(e.position),
        },
      },
    });
  });
}

/**
 * [Helpers]
 */
