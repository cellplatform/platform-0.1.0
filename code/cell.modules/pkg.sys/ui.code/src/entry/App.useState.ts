import { useRef, useState } from 'react';
import { debounceTime } from 'rxjs/operators';

import { Filesystem, t } from '../common';

type Id = string;
type Milliseconds = number;

export function useAppState(args: {
  bus: t.EventBus;
  fs?: { id: Id; path: string };
  debounce?: Milliseconds;
}) {
  const { bus } = args;
  const path = args.fs?.path;

  const storageRef = useRef<t.Fs>();
  const editorRef = useRef<t.CodeEditorInstanceEvents>();
  const [text, setText] = useState('');

  const getFs = async () => {
    if (!storageRef.current && args.fs) {
      const id = args.fs.id;
      const storage = await Filesystem.IndexedDb.create({ bus, id });
      storageRef.current = storage.fs;
    }
    return storageRef.current;
  };

  const getSavedCode = async () => {
    const fs = await getFs();
    if (!(fs && path)) return '';

    const data = await fs.read(path);
    return new TextDecoder().decode(data);
  };

  const onChanged = async () => {
    const fs = await getFs();
    const text = (await editorRef.current?.text.get.fire()) ?? '';
    setText(text);
    if (fs && path) await fs.write(path, text);
  };

  const onReady: t.DevEnvReadyHandler = async (e) => {
    const changed$ = e.editor.text.changed$.pipe(debounceTime(args.debounce ?? 500));
    changed$.subscribe(onChanged);
    editorRef.current = e.editor;

    const saved = await getSavedCode();
    if (saved) e.editor.text.set(saved);

    e.editor.focus.fire();
  };

  return {
    onReady,
    text,
  };
}
