import * as t from './types';
import * as k from '../types';

/**
 * All Values
 */
const AlignTypes: k.ListItemAlign[] = ['auto', 'smart', 'center', 'end', 'start'];
export const ALL = { AlignTypes };

/**
 * Defaults
 */
export const DEFAULT_ORIENTATION: k.ListOrientation = 'y';

export const DEFAULT_SELECTION: t.ListSelectionConfig = {
  multi: true,
  allowEmpty: true,
  keyboard: true,
};

export const DEFAULTS = {
  Orientation: DEFAULT_ORIENTATION,
  Selection: DEFAULT_SELECTION,
};
