import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Monaco } from '../../api';
import { R, t, Translate } from '../common';

/**
 * Event handlers for the Monaco code-editor instance.
 */
export function MonacoListeners(args: {
  instance: { bus: t.EventBus<any>; id: string };
  editor: t.IMonacoStandaloneCodeEditor;
}) {
  const { editor } = args;
  const { bus, id } = args.instance;
  const instance = id;

  const selection$ = new Subject<t.CodeEditorSelectionChangedEvent>();
  selection$
    .pipe(distinctUntilChanged((prev, next) => R.equals(prev, next)))
    .subscribe((e) => bus.fire(e));

  const fireFocus = (isFocused: boolean, source: 'text' | 'widget') => {
    if (source === 'text') {
      bus.fire({ type: 'sys.ui.code/changed:focus', payload: { instance, isFocused } });
    }
  };

  const fireSelection = (source: string) => {
    selection$.next({
      type: 'sys.ui.code/changed:selection',
      payload: {
        instance,
        via: source as t.CodeEditorSelectionChanged['via'],
        selection: Monaco.getSelection(editor),
      },
    });
  };

  const listeners = {
    contentChanged: editor.onDidChangeModelContent((e) => {
      const { isFlush, isRedoing, isUndoing } = e;
      const changes: t.CodeEditorTextChange[] = e.changes.map((item) => {
        return {
          text: item.text,
          range: Translate.range.toEditor(item.range),
        };
      });
      bus.fire({
        type: 'sys.ui.code/changed:text',
        payload: { instance, changes, isFlush, isRedoing, isUndoing },
      });
    }),

    cursorChanged: editor.onDidChangeCursorPosition((e) => fireSelection(e.source)),
    selectionChanged: editor.onDidChangeCursorSelection((e) => fireSelection(e.source)),
    focusEditorText: editor.onDidFocusEditorText(() => fireFocus(true, 'text')),
    focusEditorWidget: editor.onDidFocusEditorWidget(() => fireFocus(true, 'widget')),
    blurEditorText: editor.onDidBlurEditorText(() => fireFocus(false, 'text')),
    blurEditorWidget: editor.onDidBlurEditorWidget(() => fireFocus(false, 'widget')),
  };

  return {
    dispose() {
      Object.keys(listeners).forEach((key) => listeners[key].dispose());
    },
  };
}
