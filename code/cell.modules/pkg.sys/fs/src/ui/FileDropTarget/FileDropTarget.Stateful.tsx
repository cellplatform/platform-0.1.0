import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, Filesystem } from './common';
import { FileDropTarget, FileDropTargetProps } from './FileDropTarget';

type FilesystemId = string;

export type FileDropTargetStatefulProps = {
  bus: t.EventBus;
  fs: FilesystemId;
  dir?: string;
  fileFilter?: (file: t.DroppedFile) => boolean;
  style?: CssValue;
};

export const FileDropTargetStateful: React.FC<FileDropTargetStatefulProps> = (props) => {
  const { bus } = props;
  const id = props.fs;
  const rootDir = props.dir || '';

  const fileFilter = (file: t.DroppedFile) => {
    const { path } = file;
    /**
     * Known "operating system noise".
     */
    if (path.endsWith('.DS_Store')) return;

    return typeof props.fileFilter === 'function' ? props.fileFilter?.(file) : true;
  };

  const toPath = (file: t.DroppedFile, dir?: string) => {
    const prepend = (left: string, right: string) =>
      `${left.replace(/\/*$/, '')}/${right.replace(/^\/*/, '')}`;

    let path = file.path;
    if (dir) path = prepend(dir, path);
    if (rootDir) path = prepend(rootDir, path);

    return path;
  };

  /**
   * Handle files being dropped onto the surface.
   */
  const onDrop: FileDropTargetProps['onDrop'] = async (e) => {
    const store = Filesystem.Events({ bus, id });
    const fs = store.fs({});
    const files = e.files.filter(fileFilter);

    const wait = files
      .map((file) => ({ file, path: toPath(file, e.dir) }))
      .map(({ file, path }) => fs.write(path, file.data));

    await Promise.all(wait);
    store.dispose();
  };

  return <FileDropTarget style={props.style} onDrop={onDrop} />;
};

/**
 * [Hooks]
 */

/**
 * TODO 🐷
 * - put somewhere PUBLIC and OBVIOUS
 */

// export function withFilesystem(bus: t.EventBus, id: FilesystemId, dir?: string) {}

// export function useFilesystem(args: { bus: t.EventBus; id: FilesystemId; dir?: string }) {
//   const { bus, id } = args;

//   const [store, setStore] = useState<t.SysFsEvents>();
//   const [fs, setFs] = useState<t.Fs>();

//   useEffect(() => {
//     const dir = args.dir;
//     const store = Filesystem.Events({ bus, id });
//     const fs = store.fs({ dir });

//     console.log('fs', fs);

//     setStore(store);
//     setFs(fs);

//     return () => store.dispose();
//   }, [id]); // eslint-disable-line

//   return { fs, store };
// }
