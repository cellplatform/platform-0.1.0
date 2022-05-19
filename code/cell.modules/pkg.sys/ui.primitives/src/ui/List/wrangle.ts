import { DEFAULT_SELECTION, t } from './common';

/**
 * Value wrangler for the <List>.
 */
export const wrangle = {
  selection(value?: t.ListSelectionConfig | boolean): t.ListSelectionConfig {
    if (!value) return {};
    if (value === true) return DEFAULT_SELECTION;
    return value ?? {};
  },
};
