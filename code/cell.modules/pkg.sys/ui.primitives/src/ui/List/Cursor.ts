import { t } from './common';

export const Cursor = {
  /**
   * Convert a [List-Cursor] to a simple array.
   */
  toArray(cursor: t.ListCursor): t.ListItem[] {
    return Array.from({ length: cursor.total })
      .map((_, i) => cursor.getData(i))
      .filter(Boolean) as t.ListItem[];
  },
};
