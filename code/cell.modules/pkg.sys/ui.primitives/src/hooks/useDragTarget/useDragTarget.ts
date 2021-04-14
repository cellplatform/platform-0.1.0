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
  const [isDragOver, setDragOver] = useState<boolean>(false);
  const [dropped, setDropped] = useState<Dropped | undefined>();

  const reset = () => {
    setDragOver(false);
    setDropped(undefined);
  };

  useEffect(() => {
    const el = ref.current as HTMLElement;
    let count = 0;

    const dragHandler = (fn?: () => void) => {
      return (e: Event) => {
        if (fn) fn();
        e.preventDefault();
        setDragOver(count > 0);
      };
    };

    const handleDragEnter = dragHandler(() => count++);
    const handleDragOver = dragHandler();
    const handleDragLeave = dragHandler(() => count--);
    const handleMouseLeave = dragHandler(() => (count = 0));

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      count = 0;
      const { dir, files, urls } = await readDropEvent(e);
      setDropped({ dir, files, urls });
    };

    el.addEventListener('dragenter', handleDragEnter);
    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('drop', handleDrop);

    return () => {
      el.removeEventListener('dragenter', handleDragEnter);
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
