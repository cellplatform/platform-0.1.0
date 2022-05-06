import { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';

import { t } from '../common';
import { CodeEditorStateController } from './State.Controller';

type Id = string;
type Milliseconds = number;

export function useCodeEditorStateController(args: {
  bus: t.EventBus<any>;
  fs?: { id: Id; path: string };
  debounce?: Milliseconds;
}) {
  const { bus, fs } = args;
  const [text, setText] = useState('');
  const dispose$Ref = useRef(new Subject<void>());

  /**
   * Lifecycle.
   */
  useEffect(() => {
    () => dispose$Ref.current.next();
  }, []);

  /**
   * Handlers
   */
  const onReady: t.DevEnvReadyHandler = async (e) => {
    const dispose$ = dispose$Ref.current;
    const editor = e.editor;
    const state = CodeEditorStateController({ bus, editor, fs, dispose$ });

    state.text$.subscribe((e) => setText(e));
    editor.focus.fire();
  };

  /**
   * API
   */
  return { onReady, text };
}
