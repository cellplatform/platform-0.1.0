import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Monaco } from '../api.Monaco';
import { R, t, Translate } from '../common';

export function Listeners(args: {
  id: string; // ID.
  bus: t.CodeEditorEventBus;
  instance: t.IMonacoStandaloneCodeEditor;
}) {
  const { instance, id, bus } = args;

  const selection$ = new Subject<t.ICodeEditorSelectionChangedEvent>();
  selection$
    .pipe(distinctUntilChanged((prev, next) => R.equals(prev, next)))
    .subscribe((e) => bus.fire(e));

  const fireFocus = (isFocused: boolean, source: 'text' | 'widget') => {
    if (source === 'text') {
      bus.fire({ type: 'CodeEditor/changed:focus', payload: { instance: id, isFocused } });
    }
  };

  const fireSelection = (source: string) => {
    selection$.next({
      type: 'CodeEditor/changed:selection',
      payload: {
        instance: id,
        via: source as t.ICodeEditorSelectionChanged['via'],
        selection: Monaco.selection(instance),
      },
    });
  };

  const listeners = {
    contentChanged: instance.onDidChangeModelContent((e) => {
      const { isFlush, isRedoing, isUndoing } = e;
      const changes: t.ICodeEditorTextChange[] = e.changes.map((item) => {
        return {
          text: item.text,
          range: Translate.range.toEditor(item.range),
        };
      });
      bus.fire({
        type: 'CodeEditor/changed:text',
        payload: { instance: id, changes, isFlush, isRedoing, isUndoing },
      });
    }),

    cursorChanged: instance.onDidChangeCursorPosition((e) => fireSelection(e.source)),
    selectionChanged: instance.onDidChangeCursorSelection((e) => fireSelection(e.source)),
    focusEditorText: instance.onDidFocusEditorText(() => fireFocus(true, 'text')),
    focusEditorWidget: instance.onDidFocusEditorWidget(() => fireFocus(true, 'widget')),
    blurEditorText: instance.onDidBlurEditorText(() => fireFocus(false, 'text')),
    blurEditorWidget: instance.onDidBlurEditorWidget(() => fireFocus(false, 'widget')),
  };

  return {
    dispose: () => Object.keys(listeners).forEach((key) => listeners[key].dispose()),
  };
}
