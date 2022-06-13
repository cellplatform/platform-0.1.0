export * from '../common';
import { t } from '../common';

/**
 * Defaults
 */

const SHOW_AS_CARDS_ALL: t.DocListCardType[] = ['Soft', 'Stark'];
const SHOW_AS_CARDS_TRUE: t.DocListCardType = 'Stark';

export const DEFAULT = {
  showAsCards: {
    all: SHOW_AS_CARDS_ALL,
    whenTrue: SHOW_AS_CARDS_TRUE,
  },
};
