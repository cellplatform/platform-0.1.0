import { t, rx } from '../common';

import * as R from 'ramda';

type Index = number;

/**
 * Selection state modification
 */
export const ListSelection = {
  /**
   * Clean the set of selected indexes into a compact, standardised
   * data structure.
   */
  clean(indexes: t.ListSelection) {
    indexes = Array.isArray(indexes) ? indexes : [];
    indexes = indexes.filter((i) => typeof i === 'number' && i >= 0);
    return R.uniq(indexes).sort();
  },

  /**
   * Determine if the given index is selected.
   */
  isSelected(indexes: t.ListSelection | undefined, index: Index) {
    return Array.isArray(indexes) ? indexes.includes(index) : false;
  },

  // add
  // remove
  // compact sequences
};
