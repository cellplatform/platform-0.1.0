import React from 'react';

import { CssValue, Filesystem, t } from './common';
import { FileDropTarget, FileDropTargetProps } from './FileDropTarget';

type FilesystemId = string;

export type FileDropTargetStatefulProps = {
  instance: { bus: t.EventBus; id: FilesystemId };
  dir?: string;
  fileFilter?: (file: t.DroppedFile) => boolean;
  style?: CssValue;
};

export const FileDropTargetStateful: React.FC<FileDropTargetStatefulProps> = (props) => {
  const { instance } = props;
  const { bus, id } = instance;
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
