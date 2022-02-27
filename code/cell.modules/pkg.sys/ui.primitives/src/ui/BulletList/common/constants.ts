import * as k from '../types';

/**
 * All Values
 */
const AlignTypes: k.BulletListItemAlign[] = ['auto', 'smart', 'center', 'end', 'start'];
export const ALL = { AlignTypes };

/**
 * Defaults
 */
const DefaultOrientation: k.BulletOrientation = 'y';

export const DEFAULTS = { Orientation: DefaultOrientation };
export const BulletListConstants = { DEFAULTS, ALL };
