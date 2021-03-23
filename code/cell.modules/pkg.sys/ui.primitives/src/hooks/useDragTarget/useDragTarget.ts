import React, { useEffect, useState } from 'react';
import { readDropEvent } from './util';
import { t } from '../../common';

export type Dropped = {
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

    const handleDragOver = dragHandler(true);
    const handleDragLeave = dragHandler(false);
    const handleMouseLeave = dragHandler(false);

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const { dir, files, urls } = await readDropEvent(e);
      setDropped({ dir, files, urls });
    };

    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('drop', handleDrop);

    return () => {
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('drop', handleDrop);
    };
  }, [ref]);

  return {
    isDragOver,
    isDropped: Boolean(dropped),
    dropped,
    reset,
  };
}
