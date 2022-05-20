import { useEffect, useState } from 'react';
import { debounceTime } from 'rxjs/operators';

import { rx, Filesystem, t } from '../common';

type FilesystemId = string;
type DirectoryPath = string;
type Milliseconds = number;

/**
 * Manages keeping a list of paths in sync with the underlying filesystem.
 */
export function usePathListState(args: {
  instance: t.FsViewInstance;
  dir?: DirectoryPath;
  droppable?: boolean;
  debounce?: Milliseconds;
}) {
  const { dir, debounce = 50, droppable, instance } = args;
  const { bus } = instance;

  const [ready, setReady] = useState(false);
  const [drop, setDropHandler] = useState<{ handler: t.PathListDroppedHandler }>();
  const [files, setFiles] = useState<t.ManifestFile[]>([]);

  /**
   * Lifecycle
   */
  useEffect(() => {
    let isDisposed = false;
    const events = Filesystem.Events({ bus, id: instance.fs });
    const fs = events.fs(dir);

    /**
     * Read file-system.
     */
    const readPaths = async () => {
      if (isDisposed) return;
      const { files } = await fs.manifest();
      setFiles(files);
    };
    events.changed$.pipe(debounceTime(debounce)).subscribe(readPaths);

    /**
     * Handle when file drag-dropped from host OS.
     */
    if (droppable) {
      const handler: t.PathListDroppedHandler = async (e) => {
        if (isDisposed) return;
        const wait = e.files
          .map((file) => ({ file, path: Path.fromFile(file, e.dir) }))
          .map(({ file, path }) => fs.write(path, file.data));
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

    if (!ready) events.ready().then(init);

    /**
     * [Dispose]
     */
    return () => {
      isDisposed = true;
      events.dispose();
    };
  }, [instance.id, instance.fs, files, dir, debounce, droppable]); // eslint-disable-line

  /**
   * API
   */
  return {
    instance: { bus: rx.bus.instance(bus), id: instance.id, fs: instance.fs },
    ready,
    files,
    onDrop: drop?.handler,
  };
}

/**
 * [Helpers]
 */

const Path = {
  fromFile(file: { path: string }, dir?: string) {
    const path = file.path;
    return dir ? Path.prepend(dir, path) : path;
  },

  prepend(left: string, right: string) {
    return `${left.replace(/\/*$/, '')}/${right.replace(/^\/*/, '')}`;
  },
};
