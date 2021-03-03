import React, { useEffect, useState } from 'react';
import { readDropEvent } from './util';
import { t } from '../../common';

type Dropped = {
  dir: string;
  files: t.IHttpClientCellFileUpload[];
  urls: string[];
};

/**
 * Provides hooks for treating a DIV element as a "drag-n-drop" target.
 */
export function useDragTarget(ref: React.RefObject<HTMLElement>) {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [dropped, setDropped] = useState<Dropped | undefined>();

  const reset = () => {
    setIsDragOver(false);
    setDropped(undefined);
  };

  useEffect(() => {
    const el = ref.current as HTMLElement;

    const dragHandler = (isDragOver: boolean) => {
      return (e: Event) => {
        e.preventDefault();
        setIsDragOver(isDragOver);
      };
    };

    const onDragOver = dragHandler(true);
    const onDragLeave = dragHandler(false);
    const onMouseLeave = dragHandler(false);

    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      // setIsDropped(true);

      const { dir, files, urls } = await readDropEvent(e);
      setDropped({ dir, files, urls });
    };

    el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('drop', onDrop);

    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('drop', onDrop);
    };
  }, [ref]);

  return {
    isDragOver,
    dropped,
    reset,
  };
}
