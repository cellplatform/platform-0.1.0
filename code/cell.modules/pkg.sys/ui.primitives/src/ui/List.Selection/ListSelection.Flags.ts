import { t } from './common';

type Index = number;

/**
 * List selection flags.
 */
export const ListSelectionFlags = {
  selected(selection: t.ListSelection | undefined, index: Index) {
    const indexes = selection?.indexes;
    return indexes?.includes(index) ?? false;
  },
};
