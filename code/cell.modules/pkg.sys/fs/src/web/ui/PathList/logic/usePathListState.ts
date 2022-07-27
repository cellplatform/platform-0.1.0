import { useEffect, useState } from 'react';
import { debounceTime } from 'rxjs/operators';

import { Filesystem, rx, t, List, time } from '../common';
import { Cursor } from '../Cursor';

type DirectoryPath = string;
type Milliseconds = number;

/**
 * Manages keeping a list of paths in sync with the underlying filesystem.
 */
export function usePathListState(args: {
  instance: t.FsViewInstance;
  dir?: DirectoryPath;
  droppable?: boolean;
  selectable?: t.ListSelectionConfig | boolean;
  scrollable?: boolean;
  debounce?: Milliseconds;
  onStateChanged?: t.FsPathListStateChangedHandler;
}) {
  const { dir, debounce = 50, droppable, instance, selectable } = args;
  const { bus } = instance;

  const [ready, setReady] = useState(false);
  const [files, setFiles] = useState<t.ManifestFile[]>([]);
  const [drop, setDropHandler] = useState<{ handler: t.FsPathListDroppedHandler }>();
  const [dropping, setDropping] = useState(false);

  const total = files.length;
  const listState = List.useDynamicState({ total, instance, orientation: 'y', selectable });

  /**
   * Lifecycle
   */
  useEffect(() => {
    let isDisposed = false;
    const { dispose$, dispose } = rx.disposable();

    const listEvents = List.Events({ instance: { bus, id: instance.id }, dispose$ });
    const fsEvents = Filesystem.Events({ bus, id: instance.fs, dispose$ });
    const fs = fsEvents.fs(dir);

    /**
     * Bubble state changes through callback handlers.
     */
    listEvents.state.changed$.subscribe((e) => {
      const { kind, from, to } = e;
      args.onStateChanged?.({ kind, from, to, fs });
    });

    /**
     * Read file-system.
     */
    const readPaths = async () => {
      if (isDisposed) return;
      const { files } = await fs.manifest();
      setFiles(files);
    };
    fsEvents.changed$.pipe(debounceTime(debounce)).subscribe(readPaths);

    /**
     * Handle when file drag-dropped from host OS.
     */
    if (droppable) {
      const handler: t.FsPathListDroppedHandler = async (e) => {
        if (isDisposed) return;
        setDropping(true);

        await time.wait(0); // NB: Allow screen to redraw (spinner starts) before processing the file.
        const wait = e.files.map(({ path, data }) => fs.write(path, data));
        await Promise.all(wait);

        setDropping(false);
      };
      setDropHandler({ handler });
    }

    /**
     * [Initialize]
     */

    const init = async () => {
      if (isDisposed) return;
      await readPaths();
      setReady(true);
    };

    if (!ready) fsEvents.ready().then(init);

    /**
     * [Dispose]
     */
    return () => {
      isDisposed = true;
      dispose();
    };
  }, [instance.id, instance.fs, files, dir, debounce, droppable]); // eslint-disable-line

  /**
   * API
   */
  return {
    instance: { bus: rx.bus.instance(bus), id: instance.id, fs: instance.fs },
    ready,
    list: listState.state,
    data: Cursor.toFileCursor(files),
    onDrop: drop?.handler,
    get spinning() {
      return !ready || dropping;
    },
  };
}
