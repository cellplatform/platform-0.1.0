import { useEffect, useState } from 'react';
import { debounceTime } from 'rxjs/operators';

import { Filesystem, t } from '../common';

type DirectoryPath = string;
type Milliseconds = number;

/**
 * Manages keeping a list of paths in sync with the underlying filesystem.
 */
export function usePathListState(args: {
  instance: t.PathListInstance;
  dir?: DirectoryPath;
  droppable?: boolean;
  debounce?: Milliseconds;
}) {
  const { dir, debounce = 50, droppable } = args;
  const { bus, id } = args.instance;

  const [ready, setReady] = useState(false);
  const [files, setFiles] = useState<t.ManifestFile[]>([]);
  const [drop, setDrop] = useState<{ handler: t.PathListDroppedHandler }>();

  /**
   * Lifecycle
   */
  useEffect(() => {
    let isDisposed = false;
    const events = Filesystem.Events({ bus, id });
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
     * File drop handler.
     */
    if (droppable) {
      const handler: t.PathListDroppedHandler = async (e) => {
        const wait = e.files
          .map((file) => ({ file, path: toPath(file, e.dir) }))
          .map(({ file, path }) => fs.write(path, file.data));
        await Promise.all(wait);
      };
      setDrop({ handler });
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
  }, [id, files, dir, debounce, droppable]); // eslint-disable-line

  /**
   * API
   */
  return {
    id,
    ready,
    files,
    onDrop: drop?.handler,
  };
}

/**
 * [Helpers]
 */
const toPath = (file: t.DroppedFile, dir?: string) => {
  const prepend = (left: string, right: string) =>
    `${left.replace(/\/*$/, '')}/${right.replace(/^\/*/, '')}`;

  let path = file.path;
  if (dir) path = prepend(dir, path);
  // if (rootDir) path = prepend(rootDir, path);

  return path;
};
