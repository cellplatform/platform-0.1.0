import { Subject } from 'rxjs';
import { t } from '../common';

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
