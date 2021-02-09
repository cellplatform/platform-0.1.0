import { t } from '../common';

/**
 * Read/Write function for storing the current selected
 * state of an <ActionsSelect> dropdown.
 *
 * Pass [undefined] to read.
 */
export type ActionsSelectStore = (selected?: t.Actions) => Promise<t.Actions | undefined>;
