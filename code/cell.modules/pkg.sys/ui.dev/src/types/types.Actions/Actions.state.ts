import { t } from '../common';

/**
 * Read/Write function for storing the current selected
 * state of an <ActionsSelect> dropdown.
 *
 * Pass [undefined] to read.
 */
export type ActionsSelectedState = (selected?: t.DevActions) => Promise<t.DevActions | undefined>;
