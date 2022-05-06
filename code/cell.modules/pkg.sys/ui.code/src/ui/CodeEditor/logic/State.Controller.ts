import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { Filesystem, rx, t } from '../common';

type Milliseconds = number;

/**
 * Manage state changes.
 */
export function CodeEditorStateController(args: {
  bus: t.EventBus<any>;
  editor: t.CodeEditorInstanceEvents;
  fs?: { id: string; path: string };
  debounce?: Milliseconds;
  dispose$?: t.Observable<any>;
}) {
  const { editor } = args;
  const path = args.fs?.path;

  const { dispose, dispose$ } = rx.disposable(args.dispose$);
  editor.dispose$.subscribe(dispose);

  /**
   * Text (Current Editor)
   */
  const Text = {
    $: new Subject<string>(),
    current: '',
    next(value: string) {
      Text.current = value;
      Text.$.next(value);
    },
  };

  /**
   * TODO 🐷
   * - Handle singleton instances of Filesystem.
   */

  /**
   * Filesystem
   */
  let _fs: t.Fs | undefined;
  const Fs = {
    async init() {
      const id = args.fs?.id;
      const bus = args.bus;
      const store = await Filesystem.IndexedDb.create({ bus, id, dispose$ });
      return store.fs;
    },

    async get() {
      if (args.fs && !_fs) _fs = await Fs.init();
      return _fs as t.Fs;
    },

    async read() {
      const fs = await Fs.get();
      if (!(fs && path)) return '';
      return new TextDecoder().decode(await fs.read(path));
    },

    async write(text: string) {
      const fs = await Fs.get();
      if (fs && path) await fs.write(path, text);
    },
  };

  /**
   * Handlers
   */
  editor.text.changed$
    .pipe(takeUntil(dispose$), debounceTime(args.debounce ?? 500))
    .subscribe(async () => {
      const text = (await editor.text.get.fire()) ?? '';
      Text.next(text);
      await Fs.write(text);
    });

  /**
   * Initialize
   */
  (async () => {
    const saved = await Fs.read();
    if (saved) editor.text.set(saved);
  })();

  /**
   * API
   */
  return {
    dispose,
    dispose$,
    text$: Text.$.pipe(takeUntil(dispose$)),
    get text() {
      return Text.current;
    },
  };
}
