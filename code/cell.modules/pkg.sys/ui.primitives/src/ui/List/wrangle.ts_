import { DEFAULT_SELECTION, t } from './common';
import { Cursor } from './Cursor';

/**
 * Value wrangler for the <List>.
 */
export const Wrangle = {
  selection(value?: t.ListSelectionConfig | boolean): t.ListSelectionConfig {
    if (!value) return {};
    if (value === true) return DEFAULT_SELECTION;
    return value ?? {};
  },

  items(input: t.ListItem[] | t.ListCursor): t.ListItem[] {
    return Array.isArray(input) ? input : Cursor.toArray(input);
  },
};
