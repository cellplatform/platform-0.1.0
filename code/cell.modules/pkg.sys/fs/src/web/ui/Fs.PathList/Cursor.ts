import { t } from './common';

export const Cursor = {
  /**
   * Generate an empty "dummy" cursor.
   * NB: Used for development.
   */
  dummy(): t.FsPathListCursor {
    return { total: 0, getData: () => null as never };
  },

  /**
   * Convert an array of files to a [File-Cursor].
   */
  toFileCursor(files: t.ManifestFile[]): t.FsPathListCursor {
    return { total: files.length, getData: (index) => files[index] };
  },

  /**
   * Enumerate a [File-Cursor].
   */
  forEach(cursor: t.FsPathListCursor, callback: (file: t.ManifestFile) => any) {
    Array.from({ length: cursor.total }).forEach((v, i) => callback(cursor.getData(i)));
  },
};
