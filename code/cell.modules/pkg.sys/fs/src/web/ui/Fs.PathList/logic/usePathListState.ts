import { useEffect, useState } from 'react';
import { debounceTime } from 'rxjs/operators';

import { Filesystem, rx, t, List } from '../common';

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
  debounce?: Milliseconds;
  onStateChange?: t.FsPathListStateChangedHandler;
}) {
  const { dir, debounce = 50, droppable, instance, selectable } = args;
  const { bus } = instance;

  const [ready, setReady] = useState(false);
  const [drop, setDropHandler] = useState<{ handler: t.FsPathListDroppedHandler }>();
  const [files, setFiles] = useState<t.ManifestFile[]>([]);

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
      args.onStateChange?.({ kind, from, to });
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
        const wait = e.files.map(({ path, data }) => fs.write(path, data));
        await Promise.all(wait);
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
    files,
    total,
    lazy: listState.state,
    onDrop: drop?.handler,
  };
}
